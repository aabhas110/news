#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -d prisma/migrations ]; then
    ./node_modules/.bin/prisma migrate deploy
  else
    echo "No prisma/migrations directory found; skipping migrate deploy."
  fi
fi

if [ "$RUN_DB_PUSH" = "true" ]; then
  ./node_modules/.bin/prisma db push --skip-generate
fi

exec "$@"
