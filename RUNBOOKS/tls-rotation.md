# TLS Rotation Runbook

Steps to renew and rotate TLS certificates.

## Prerequisites
- Access to production hosts.
- Control over the certificate authority or secret store.

## Steps
1. Check the current certificate expiry:
   `openssl s_client -connect <domain>:443 -servername <domain> -showcerts`.
2. Run the renewal script:
   ```bash
   certbot renew --dry-run
   certbot renew && systemctl reload nginx
   ```
3. Verify the new certificate with `curl -v https://<domain>`.
4. Update monitoring alerts to warn 15 days before expiration.

## Rollback
1. Restore the previous certificate from `/etc/letsencrypt/backups`.
2. Reload the service.
3. Notify the security team.

## Contacts
- **DevOps On-Call**: devops@example.com
- **Security Team**: security@example.com
