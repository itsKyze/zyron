#!/usr/bin/env bash
cd /home/kyzedev/zyron/apps/openbot/app
set -a
[ -f ../.env ] && source ../.env
set +a
APP_PORT=3025 exec bun serve.ts
