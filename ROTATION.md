# Secret Rotation Guide

This document outlines the steps to rotate application secrets stored in the vault. Rotate regularly and immediately if compromise is suspected.

## JWT_SECRET
1. Generate a new secret:
   ```bash
   openssl rand -base64 64
   ```
2. Store the new value in the secret vault under `JWT_SECRET`.
3. Redeploy the server with the updated secret.
4. Revoke existing tokens; users must reauthenticate.

## SESSION_SECRET
1. Generate a new secret string (64+ chars).
2. Update `SESSION_SECRET` in the vault.
3. Restart the server to apply the new secret.
4. Invalidate existing sessions to force re-login.

## FILE_SIGNATURE_SECRET
1. Generate a new secret string (64+ chars).
2. Update the `FILE_SIGNATURE_SECRET` entry in the vault.
3. Redeploy services that sign or verify files.
4. Re-sign any persistent files if required.

## DB_ENCRYPTION_KEY
1. Generate a new key:
   ```bash
   openssl rand -hex 64
   ```
2. Add the new key to the vault as `DB_ENCRYPTION_KEY` and keep the previous key as `DB_ENCRYPTION_KEY_PREVIOUS` during rotation.
3. Run the database encryption migration or re-encrypt existing data using the new key.
4. Deploy the application with both keys set, then remove `DB_ENCRYPTION_KEY_PREVIOUS` after successful rotation.

Always commit this file without including any real secret values.

