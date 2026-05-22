#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi

exec "$@"
