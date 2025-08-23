import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import env from '../server/utils/env';
import { antivirusScanner, type ScanResult } from '../server/utils/antivirus';
import { quarantineFile } from '../server/utils/quarantine';
import { log } from '../server/utils/logger';

type ErrorResponse = { statusCode: number; body: unknown };
type ErrorResponseCreator = (
  code: string,
  message: string,
  details: unknown,
  statusCode: number
) => ErrorResponse;

interface ScanFileOptions {
  createErrorResponse?: ErrorResponseCreator;
}

export function createScanFile(options: ScanFileOptions = {}) {
  const { createErrorResponse } = options;

  return async function scanFile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        if (createErrorResponse) {
          const error = createErrorResponse(
            'VALIDATION_ERROR',
            'No file uploaded',
            { field: 'file', message: 'Please select a file to upload' },
            400
          );
          return res.status(error.statusCode).json(error.body);
        }

        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
      }

      const file = req.file;
      const scanResult: ScanResult = await antivirusScanner.scanBuffer(
        file.buffer,
        file.originalname
      );

      if (!scanResult.isClean) {
        await quarantineFile(file.buffer, file.originalname);
        log.error(
          'Virus detected in uploaded file',
          {
            fileName: file.originalname,
            threats: scanResult.threats,
            provider: scanResult.provider,
            user: (req as any).user?.id,
            severity: 'high'
          },
          'SECURITY'
        );

        if (createErrorResponse) {
          const error = createErrorResponse(
            'SECURITY_ERROR',
            'Virus detected',
            {
              message:
                'The uploaded file contains malicious content and has been quarantined',
              threats: scanResult.threats,
              scanProvider: scanResult.provider
            },
            422
          );
          return res.status(error.statusCode).json(error.body);
        }

        return res.status(422).json({
          error: 'Virus detected',
          message:
            'The uploaded file contains malicious content and has been quarantined',
          threats: scanResult.threats,
          scanProvider: scanResult.provider
        });
      }

      (req as any).scanResult = scanResult;
      log.info(
        'File passed antivirus scan',
        {
          fileName: file.originalname,
          scanTime: scanResult.scanTime,
          provider: scanResult.provider,
          user: (req as any).user?.id
        },
        'SECURITY'
      );

      next();
    } catch (error) {
      log.error('Antivirus scan failed', error as Error, 'SECURITY');
      if (createErrorResponse) {
        const err = createErrorResponse(
          'INTERNAL_ERROR',
          'Security scan failed',
          { message: 'Unable to complete security scan - file rejected' },
          500
        );
        return res.status(err.statusCode).json(err.body);
      }
      res.status(500).json({
        error: 'Security scan failed',
        message: 'Unable to complete security scan - file rejected'
      });
    }
  };
}

export function verifySignedUrl(
  fileId: string,
  expires: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.FILE_SIGNATURE_SECRET)
      .update(`${fileId}:${expires}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

