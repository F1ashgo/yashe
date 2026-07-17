# 阿里云服务器日常运维操作手册 (Atelier des Miyabi 生产运行版)

本手册是为您与开发团队整理的**全栈日常运维速查手册（Runbook）**。涵盖系统物理状态监控、服务生命周期管理、常用日志分析、数据库紧急处理、安全防范以及数据灾备的全套实操命令。

---

## 🔑 账号、密码与端口配置速查表

| 组件/服务 | 监听端口 (Port) | 连接用户 (User) | 安全强密码 (Password) | 访问控制规则 |
| :--- | :--- | :--- | :--- | :--- |
| **MySQL** | `3306` | `dengshanzu` | **`wsad824600`** | 仅限本地 `127.0.0.1` 访问，禁止外网暴露 |
| **Redis** | `6379` | *无* | **`SuperStrongRedisPassword_5678`** | 仅限本地 `127.0.0.1` 访问，禁止外网暴露 |
| **Spring Boot** | `8080` | `root` | *运行Jar无密码* | 内网由 Nginx 代理，不对公网开通 8080 安全组 |
| **Nginx (测试)** | `8000` | *无* | *无需密码* | 备案期间公网测试端口，限制为您的本机 IP 访问 |
| **Nginx (正式)** | `80` / `443` | *无* | *无需密码* | 备案通过后正式启用，允许全球所有 IP 访问 |

---

## 目录
1. [系统资源与硬件健康排查](#一-系统资源与硬件健康排查)
2. [全栈服务进程生命周期管理](#二-全栈服务进程生命周期管理)
3. [日志分析与安全审计命令](#三-日志分析与安全审计命令)
4. [数据库紧急运维与锁表处理](#四-数据库紧急运维与锁表处理)
5. [系统内置防火墙（Firewalld）控制](#五-系统内置防火墙firewalld控制)
6. [数据压缩备份与文件传输](#六-数据压缩备份与文件传输)

---

## 一、 系统资源与硬件健康排查

当服务器出现卡顿、无响应时，首要任务是排查硬件指标：

### 1. 内存使用情况排查
```bash
# 友好格式查看内存及虚拟内存（Swap）使用率
free -h
```
* **注意**：如果 `available`（可用）内存低于 200MB，或者 `Swap` 已经被大量占用，说明系统内存吃紧，需要排查 Spring Boot 的 Java 堆内存配置。

### 2. 磁盘空间与大文件定位
```bash
# 1. 查看各分区磁盘占用比例
df -h

# 2. 定位当前目录下占用空间最大的前 10 个文件或文件夹（排查日志撑爆磁盘）
du -sh * | sort -rh | head -n 10
```

### 3. CPU 与负载实时监控
```bash
# 实时显示进程占用的 CPU、内存以及系统负载（按 Shift + M 可按内存排序，按 Shift + P 按 CPU 排序）
top
# 退出按 q
```
* **指标解读**：关注 `load average`（系统负载）。对于 2 核的 ECS 服务器，如果 1 分钟内的负载超过 `2.0`，说明 CPU 处于满负荷超载状态。

---

## 二、 全栈服务进程生命周期管理

项目中所有服务均由 Systemd 托管，以下是日常启停及排查状态的标准命令：

| 服务名称 | 启动命令 | 停止命令 | 重启命令 | 查看状态命令 |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx** (Web) | `systemctl start nginx` | `systemctl stop nginx` | `systemctl restart nginx` | `systemctl status nginx` |
| **Spring Boot** (后端) | `systemctl start yashe-api` | `systemctl stop yashe-api` | `systemctl restart yashe-api` | `systemctl status yashe-api` |
| **MySQL** (数据库) | `systemctl start mysqld` | `systemctl stop mysqld` | `systemctl restart mysqld` | `systemctl status mysqld` |
| **Redis** (缓存) | `systemctl start redis` | `systemctl stop redis` | `systemctl restart redis` | `systemctl status redis` |

### 💡 进程网络监控常用命令：
```bash
# 1. 检查 Nginx (8000/80)、Spring Boot (8080)、MySQL (3306)、Redis (6379) 的端口监听情况
ss -tunlp

# 2. 查看特定端口被哪个进程占用了（以 8080 为例）
lsof -i :8080
# 或
netstat -tunlp | grep 8080
```

---

## 三、 日志分析与安全审计命令

通过日志可以快速定位攻击源、统计访问流量以及发现系统报错。

### 1. Nginx 访问日志分析（UV/PV 流量统计）
```bash
# A. 实时监控前 100 个访问请求中的 IP 来源与访问路径
tail -n 100 /var/log/nginx/access.log | awk '{print $1, $7}'

# B. 统计今日访问量最高的 Top 10 IP 地址（排查恶意爬虫与暴力刷接口）
cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -n 10

# C. 统计 Nginx 返回 500/502/504 错误状态码的请求（排查后端服务崩溃）
grep -E '" 50[0-9] ' /var/log/nginx/access.log | tail -n 50
```

### 2. 系统安全审计（防黑客暴力破解 SSH）
```bash
# A. 查看近期有哪些 IP 在尝试用错误的密码暴力破解您的 SSH 登录（阿里云红帽系系统）
grep "Failed password" /var/log/secure | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -n 10
# (注：如果某 IP 尝试了几百次，建议立即在阿里云安全组中拉黑此 IP)

# B. 查看当前已经成功登录服务器的会话
w
```

---

## 四、 数据库紧急运维与锁表处理

当后端报错 `Lock wait timeout exceeded` 或者 MySQL 占用 CPU 达到 100% 时，需执行以下紧急排查：

### 1. 登录并查找导致锁表或运行慢的 SQL 线程
```bash
# 登录 MySQL 命令行
mysql -u dengshanzu -pwsad824600
```
在 MySQL 命令行内执行：
```sql
USE yashe_db;

-- 1. 查看当前所有正在执行的线程
SHOW FULL PROCESSLIST;

-- 2. 查看当前正在等待锁的事务
SELECT * FROM information_schema.INNODB_TRX;
```
*如果发现某个查询的 `Time` 列数值非常大（比如几千秒），且 `State` 为 `Sending data` 或 `Waiting for table metadata lock`，说明该连接卡死了。*

### 2. 紧急中止卡死线程
记下该线程的 `Id`（例如 `1024`），并在 MySQL 命令行中执行：
```sql
KILL 1024; -- 强行终止该卡死连接，释放锁资源
```

### 3. 清理 Redis 全部缓存（慎用）
如果由于脏数据导致项目报错，需要紧急清空 Redis 缓存：
```bash
# 进入 Redis CLI 并认证
redis-cli
> auth SuperStrongRedisPassword_5678

# 清空当前数据库所有 key (立即生效，慎用)
> FLUSHDB

# 清空所有 Redis 数据库的所有 key (慎用)
> FLUSHALL
```

---

## 五、 系统内置防火墙（Firewalld）控制

如果开启了系统级内置防火墙，以下是常用的配置维护命令：

```bash
# 1. 查看内置防火墙当前状态
systemctl status firewalld

# 2. 查看当前已经放行的端口和规则
firewall-cmd --list-all

# 3. 永久放行一个自定义测试端口（例如 8000 端口）
firewall-cmd --zone=public --add-port=8000/tcp --permanent
# 重载防火墙使规则生效（必做）
firewall-cmd --reload

# 4. 移除已放行的端口
firewall-cmd --zone=public --remove-port=8000/tcp --permanent
firewall-cmd --reload
```

---

## 六、 数据压缩备份与文件传输

用于手动备份项目上传的图片资产文件夹、打包代码或分发数据包：

### 1. 将项目文件夹压缩为 tar.gz 包
```bash
# 将前端及上传素材所在的整个目录压缩备份为 yashe_frontend_backup.tar.gz
tar -czvf /var/www/yashe/yashe_frontend_backup.tar.gz -C /var/www/yashe/ frontend/
```

### 2. 解压备份包
```bash
# 解压文件到指定目录下
tar -xzvf /var/www/yashe/yashe_frontend_backup.tar.gz -C /var/www/yashe/
```

### 3. 命令行网络测速与连通性排查
```bash
# 1. 检查服务器能否访问外网（测试 DNS 和网络连通性）
curl -I https://www.baidu.com

# 2. 检查服务器本地后端接口是否通畅
curl -i http://127.0.0.1:8080/api/auth/me
```
