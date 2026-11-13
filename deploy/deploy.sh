#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ ! -f .env ]]; then
    echo 'Create .env from .env.example and set DATABASE_PASSWORD and MYSQL_ROOT_PASSWORD first.' >&2
    exit 1
fi

compose=(docker compose --env-file .env --env-file images.env -f compose.yaml)
"${compose[@]}" config --quiet
docker image load --input images.tar
"${compose[@]}" up -d --pull never --wait --wait-timeout 240
"${compose[@]}" ps
echo 'Deployment ready. Use the server address and HTTP_PORT configured in .env.'
