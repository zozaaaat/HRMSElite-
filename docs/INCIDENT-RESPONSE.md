# Incident Response Guide

Use this guide to handle production incidents quickly and consistently.

## 1. Preparation
- Keep on-call and escalation contacts up to date.
- Ensure monitoring, alerts, and backups are functioning.

## 2. Identification
- Confirm the incident via alerts or user reports.
- Capture timestamps, logs, metrics, and recent changes.

## 3. Containment
- Limit blast radius: disable affected features or reroute traffic.
- Preserve evidence for later analysis.

## 4. Eradication and Recovery
- Fix or roll back the offending change.
- If data is impacted, restore from the latest good backup.
- Validate services with health checks and smoke tests.

## 5. Post-Incident
- Document root cause, timeline, and remediation steps.
- Create follow-up issues for long-term fixes and add tests or alerts.

Maintain and review this guide regularly so the team is ready for the next incident.
