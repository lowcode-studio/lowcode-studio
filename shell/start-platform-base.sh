# !/bin/bash 测试基础镜像

docker run -d \
  --name platform-base \
  -p 3306:3306 \
  -p 5432:5432 \
  -p 6379:6379 \
  -p 8000:8000 \
  -p 8443:8443 \
  -p 8001:8001 \
  -p 8444:8444 \
  -p 9000:9000 \
  -p 9001:9001 \
  -p 1337:1337 \
  -v "$PWD/config/mysql:/config/mysql" \
  -v "$PWD/config/kong:/config/kong" \
  -v "$PWD/config/konga:/config/konga" \
  -v "$PWD/data/mysql:/var/lib/mysql" \
  -v "$PWD/data/postgresql:/var/lib/postgresql/10/main" \
  -v "$PWD/data/minio:/data/minio" \
  -v "$PWD/logs/postgresql:/var/log/postgresql" \
  -v "$PWD/logs/mysql:/var/log/mysql" \
  -v "$PWD/logs/kong:/var/log/kong" \
  -v "$PWD/logs/konga:/var/log/konga" \
  -v "$PWD/logs/minio:/var/log/minio" \
  lowcodestudio/platform-base:1.0
