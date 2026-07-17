# MySQL 数据库日常运维与备份恢复指南

本指南面向 **“雅舍 (Atelier des Miyabi)”** 项目的本地 MySQL 数据库（`yashe_db`），提供了包括**自动备份脚本**、**数据恢复**、**性能监控**以及**日常安全加固**的常用运维脚本 and 命令。

---

## 一、 数据库备份与恢复 (手动操作)

### 1. 手动备份数据库
使用 `mysqldump` 进行逻辑备份，并通过 `gzip` 压缩以节省磁盘空间：
```bash
# 备份并压缩 yashe_db，文件名带上时间戳
mysqldump -u dengshanzu -pwsad824600 yashe_db | gzip > /var/www/yashe/sql/yashe_db_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. 手动恢复数据库
当发生数据误删需要回滚时，使用以下命令解压并导入数据：
```bash
# 解压并导入指定的备份文件
gunzip < /var/www/yashe/sql/yashe_db_backup_XXXXXXXX.sql.gz | mysql -u dengshanzu -pwsad824600 yashe_db
```

---

## 二、 自动化定时备份配置 (Crontab)

为了防止数据丢失，建议配置每日凌晨自动备份，并自动清理 30 天以前的旧备份。

### 1. 编写备份脚本 `mysql_backup.sh`
在服务器 `/var/www/yashe/sql/` 目录下创建脚本：
```bash
nano /var/www/yashe/sql/mysql_backup.sh
```

粘贴以下备份脚本内容：
```bash
#!/bin/bash

# 配置信息
DB_USER="dengshanzu"
DB_PASS="wsad824600"
DB_NAME="yashe_db"
BACKUP_DIR="/var/www/yashe/sql/backups"
KEEP_DAYS=30 # 备份保留天数

# 创建备份目录
mkdir -p $BACKUP_DIR

# 生成备份文件名
FILE_NAME="$BACKUP_DIR/${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# 执行备份并记录日志
echo "[$(date)] 开始备份数据库 $DB_NAME..."
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $FILE_NAME

if [ $? -eq 0 ]; then
    echo "[$(date)] 备份成功，文件保存至: $FILE_NAME"
else
    echo "[$(date)] 备份失败！"
    exit 1
fi

# 清理超过 30 天的旧备份
find $BACKUP_DIR -mtime +$KEEP_DAYS -name "${DB_NAME}_backup_*.sql.gz" -exec rm -rf {} \;
echo "[$(date)] 历史备份清理完成（已删除超过 ${KEEP_DAYS} 天的备份文件）。"
```
*（按 `Ctrl + O` 保存，回车确认，按 `Ctrl + X` 退出）*

赋予脚本执行权限：
```bash
chmod +x /var/www/yashe/sql/mysql_backup.sh
```

### 2. 配置定时任务 (Crontab)
运行命令编辑定时任务：
```bash
crontab -e
```
在文件末尾添加以下这行（**每天凌晨 2:00** 自动执行备份，并将日志输出到 `backup.log`）：
```text
0 2 * * * /bin/bash /var/www/yashe/sql/mysql_backup.sh >> /var/www/yashe/sql/backup.log 2>&1
```

---

## 三、 数据库日常运行状态监控

### 1. 查看数据库基本运行状态
查看当前并发连接数、运行时间、查询吞吐量等指标：
```bash
mysqladmin -u dengshanzu -pwsad824600 status
```
*输出示例：`Uptime: 20432  Threads: 2  Questions: 154  Slow queries: 0  Opens: 121  Flush tables: 3  Open tables: 114  Queries per second avg: 0.007`*

### 2. 查看当前正在执行的 SQL 线程 (排查锁表/死锁)
当发现页面加载极慢时，可能是某些 SQL 语句卡住锁表了，运行以下命令查看：
```bash
mysqladmin -u dengshanzu -pwsad824600 processlist
```
*或者进入 MySQL 运行：`SHOW FULL PROCESSLIST;`。如果有大量的 `Sleep` 或者是运行时间很长的 `Query`，可以使用 `kill <Id>;` 命令强行结束该连接。*

### 3. 查看数据库中各表占用的磁盘空间大小
登录 MySQL 后，运行以下 SQL 可以直观地看到每个数据表占用的存储空间：
```sql
USE information_schema;
SELECT 
    table_name AS `表名`,
    round(((data_length + index_length) / 1024 / 1024), 2) `大小 (MB)`,
    table_rows AS `行数`
FROM tables 
WHERE table_schema = 'yashe_db';
```

---

## 四、 数据库安全加固与维护

### 1. 确保 MySQL 仅监听本地 (核心安全)
原生安装的 MySQL 必须只监听 `127.0.0.1`。
1. 编辑 MySQL 配置文件：
   ```bash
   nano /etc/my.cnf  # 或 /etc/my.cnf.d/mysql-server.cnf
   ```
2. 确保在 `[mysqld]` 段落下包含以下配置：
   ```ini
   bind-address = 127.0.0.1
   ```
3. 重启 MySQL 生效：`systemctl restart mysqld`。

### 2. 修改数据库用户的密码
如果后续需要修改 `dengshanzu` 账户的密码，登录 MySQL 后运行：
```sql
ALTER USER 'dengshanzu'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
```
*⚠️ 修改完后，请记得同步更新后端 Spring Boot 配置文件 `/var/www/yashe/backend/.env` 中的 `DB_PASSWORD` 密码，并重启服务。*

### 3. 数据表碎片整理与优化
如果某个表经历了大量的 `DELETE` 或 `UPDATE` 操作，会产生磁盘碎片，导致查询变慢。可以定期运行优化命令收缩空间：
```sql
-- 登录 MySQL 后运行，优化指定的数据表
OPTIMIZE TABLE users;
OPTIMIZE TABLE contact_messages;
```
