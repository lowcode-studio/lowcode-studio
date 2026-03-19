# !/bin/bash  删除所有数据和日志文件，谨慎操作！

# 清理确认
read -p "此操作将删除所有数据和日志文件，是否继续？(y/n) " confirm
if [[ "$confirm" != "y" ]]; then
  echo "操作已取消。"
  exit 0
fi

# 清理数据目录
rm -rf data/mysql/*
rm -rf data/postgresql/*

# 清理日志目录
rm -rf logs/mysql/*
rm -rf logs/postgresql/*
rm -rf logs/kong/*
rm -rf logs/konga/*
rm -rf logs/minio/*
rm -rf logs/platform/*

# 整个目录查询  .DS_Store
find . -name ".DS_Store" -type f -delete