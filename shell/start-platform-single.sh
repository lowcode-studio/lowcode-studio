#!/bin/bash

echo "=== 启动 Lowcode Platform 单一容器 ==="

docker run -d \
  --name lowcode-platform-amd64 \
  --platform linux/amd64 \
  -p 8000:8000 \
  -p 3306:3306 \
  -p 5432:5432 \
  -p 1337:1337 \
  -p 9001:9001 \
  -v "$PWD/config:/config" \
  -v "$PWD/data/mysql:/var/lib/mysql" \
  -v "$PWD/data/postgresql:/var/lib/postgresql/10/main" \
  -v "$PWD/data/minio:/data/minio" \
  -v "$PWD/logs/mysql:/var/log/mysql" \
  -v "$PWD/logs/kong:/var/log/kong" \
  -v "$PWD/logs/platform:/var/log/platform" \
  lowcodestudio/lowcode-platform:2026-03-amd64



# docker run -d \
#   --name lowcode-platform-arm64 \
#   -p 8000:8000 \
#   -p 3306:3306 \
#   -p 5432:5432 \
#   -p 1337:1337 \
#   -p 9001:9001 \
#   -e "PLATFORM_URL=http://localhost:8000" \
#   -e "PLATFORM_WS_URL=ws://localhost:8000" \
#   -v "$PWD/config:/config" \
#   -v "$PWD/data/mysql:/var/lib/mysql" \
#   -v "$PWD/data/postgresql:/var/lib/postgresql/10/main" \
#   -v "$PWD/data/minio:/data/minio" \
#   -v "$PWD/logs/mysql:/var/log/mysql" \
#   -v "$PWD/logs/kong:/var/log/kong" \
#   -v "$PWD/logs/platform:/var/log/platform" \
#   lowcodestudio/lowcode-platform:2026-03-arm64

