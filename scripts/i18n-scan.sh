#!/usr/bin/env bash
set -euo pipefail
# ابحث عن أحرف عربية في TS/TSX/JS/HTML خارج مجلد locales
rg --pcre2 -n "[\x{0600}-\x{06FF}]" \
  --glob "!client/src/locales/**" \
  --glob "client/src/**" || true | tee /tmp/i18n_arabic_hits.txt
AR=$(wc -l </tmp/i18n_arabic_hits.txt)
if [ "$AR" -gt "0" ]; then
  echo "i18n scan failed: Arabic literals found ($AR). Externalize strings." >&2
  exit 1
fi
exit 0
