export function assertDatabaseEncryption() {
  const enabled = process.env.DB_ENCRYPTION_ENABLED?.toLowerCase() === 'true';
  const key = process.env.DB_ENCRYPTION_KEY || '';
  if (!enabled) {
    console.error('[DB] Encryption is mandatory: set DB_ENCRYPTION_ENABLED=true');
    process.exit(1);
  }
  if (key.length < 32) {
    console.error('[DB] DB_ENCRYPTION_KEY must be >=32 chars');
    process.exit(1);
  }
}
