# PII Protection Policy

This document outlines how HRMS Elite handles personally identifiable information (PII).

## Classification
- **Email:** user and employee email addresses, company contact emails.
- **Phone:** employee and company phone numbers.
- **IDs:** passport numbers, civil IDs, residence numbers, commercial and tax numbers, session identifiers.

## Retention
- `sessions`: delete after 30 days.
- `employees`: mask terminated employee data after 7 years.
- `notifications`: delete after 90 days.
- `employeeLeaves`: archive after 5 years.
- `users`: delete inactive users after 5 years.
- `companies`: mask inactive company identifiers after 10 years.

A scheduled job runs daily to apply these policies automatically.

## Masking
Sensitive fields are partially masked in logs and export operations. Emails retain their domain, phone and identifier fields keep the last digits only.

## Usage
The `DataMaskingManager` provides utilities for masking and retention enforcement. `scheduleRetentionJobs` should be called on server startup to ensure periodic cleanup.
