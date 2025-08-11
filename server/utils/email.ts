import nodemailer from 'nodemailer';
import {log} from './logger';

/**
 * Email utility functions for HRMS Elite
 * Handles sending verification and password reset emails
 */

// Email configuration
const EMAIL_CONFIG = {
  'host': process.env.SMTP_HOST ?? 'smtp.gmail.com',
  'port': parseInt(process.env.SMTP_PORT ?? '587'),
  'secure': false, // true for 465, false for other ports
  'auth': {
    'user': process.env.SMTP_USER ?? '',
    'pass': process.env.SMTP_PASS ?? ''
  }
};

const FROM_EMAIL = process.env.SMTP_FROM ?? 'noreply@hrms-elite.com';
const APP_NAME = 'HRMS Elite';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

/**
 * Create email transporter
 * @returns Nodemailer transporter
 */
const createTransporter = () => {

  return nodemailer.createTransport(EMAIL_CONFIG);

};

/**
 * Send email verification email
 * @param email - User's email address
 * @param token - Verification token
 * @param firstName - User's first name
 * @returns Promise<boolean> - Success status
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  firstName: string
): Promise<boolean> => {

  try {

    const transporter = createTransporter();
    const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

    const mailOptions = {
      'from': FROM_EMAIL,
      'to': email,
      'subject': `تأكيد البريد الإلكتروني - ${APP_NAME}`,
      'html': `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">مرحباً ${firstName}!</h2>
          <p>شكراً لك على التسجيل في ${APP_NAME}.</p>
          <p>يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              تأكيد البريد الإلكتروني
            </a>
          </div>
          <p>أو انسخ الرابط التالي إلى متصفحك:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${verificationUrl}</p>
          <p>هذا الرابط صالح لمدة 24 ساعة فقط.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 12px;">
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
      `,
      'text': `
        مرحباً ${firstName}!
        
        شكراً لك على التسجيل في ${APP_NAME}.
        
        يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط التالي:
        ${verificationUrl}
        
        هذا الرابط صالح لمدة 24 ساعة فقط.
        
        إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني.
      `
    };

    await transporter.sendMail(mailOptions);
    log.info(`Verification email sent to ${email}`, undefined, 'EMAIL');
    return true;

  } catch (error) {

    log.error(`Error sending verification email to ${email}:`, error as Error, 'EMAIL');
    return false;

  }

};

/**
 * Send password reset email
 * @param email - User's email address
 * @param token - Reset token
 * @param firstName - User's first name
 * @returns Promise<boolean> - Success status
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  firstName: string
): Promise<boolean> => {

  try {

    const transporter = createTransporter();
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

    const mailOptions = {
      'from': FROM_EMAIL,
      'to': email,
      'subject': `إعادة تعيين كلمة المرور - ${APP_NAME}`,
      'html': `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">مرحباً ${firstName}!</h2>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
          <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e74c3c; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p>أو انسخ الرابط التالي إلى متصفحك:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
          <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 12px;">
            لأسباب أمنية، لن يتم إرسال رابط إعادة التعيين مرة أخرى.
          </p>
        </div>
      `,
      'text': `
        مرحباً ${firstName}!
        
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.
        
        انقر على الرابط التالي لإعادة تعيين كلمة المرور:
        ${resetUrl}
        
        هذا الرابط صالح لمدة ساعة واحدة فقط.
        
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
      `
    };

    await transporter.sendMail(mailOptions);
    log.info(`Password reset email sent to ${email}`, undefined, 'EMAIL');
    return true;

  } catch (error) {

    log.error(`Error sending password reset email to ${email}:`, error as Error, 'EMAIL');
    return false;

  }

};

/**
 * Send welcome email
 * @param email - User's email address
 * @param firstName - User's first name
 * @returns Promise<boolean> - Success status
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {

  try {

    const transporter = createTransporter();

    const mailOptions = {
      'from': FROM_EMAIL,
      'to': email,
      'subject': `مرحباً بك في ${APP_NAME}!`,
      'html': `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">مرحباً ${firstName}!</h2>
          <p>أهلاً وسهلاً بك في ${APP_NAME}!</p>
          <p>تم إنشاء حسابك بنجاح ويمكنك الآن الوصول إلى جميع ميزات النظام.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${BASE_URL}/login" 
               style="background-color: #27ae60; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              تسجيل الدخول
            </a>
          </div>
          <p>إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 12px;">
            شكراً لك على اختيار ${APP_NAME}!
          </p>
        </div>
      `,
      'text': `
        مرحباً ${firstName}!
        
        أهلاً وسهلاً بك في ${APP_NAME}!
        
        تم إنشاء حسابك بنجاح ويمكنك الآن الوصول إلى جميع ميزات النظام.
        
        يمكنك تسجيل الدخول من خلال: ${BASE_URL}/login
        
        إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم.
        
        شكراً لك على اختيار ${APP_NAME}!
      `
    };

    await transporter.sendMail(mailOptions);
    log.info(`Welcome email sent to ${email}`, undefined, 'EMAIL');
    return true;

  } catch (error) {

    log.error(`Error sending welcome email to ${email}:`, error as Error, 'EMAIL');
    return false;

  }

};
