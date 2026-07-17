#!/bin/bash
set -uo pipefail

# ==============================================================================
# 雅舍 (Atelier des Miyabi) 服务器日常全链路调度脚本
# 调度内容：数据库备份、日志归档与清理、服务状态自检与自动拉起、系统资源预警
# 建议执行时间：每日凌晨 3:00 (通过 Crontab 定时调用)
# ==============================================================================

# ----------------- 1. 参数与路径配置 -----------------
CONFIG_FILE="${YASHE_MAINTENANCE_ENV:-/etc/yashe/maintenance.env}"
[[ -r "$CONFIG_FILE" ]] || { echo "maintenance config unreadable: $CONFIG_FILE" >&2; exit 1; }

if [[ "${YASHE_SKIP_PERMISSION_CHECK:-0}" != "1" ]] && command -v stat >/dev/null 2>&1; then
    CONFIG_MODE="$(stat -c '%a' "$CONFIG_FILE" 2>/dev/null || true)"
    if [[ -n "$CONFIG_MODE" && "${CONFIG_MODE: -2}" != "00" ]]; then
        echo "maintenance config permissions must be 0600: $CONFIG_FILE" >&2
        exit 1
    fi
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"
: "${MYSQL_DEFAULTS_FILE:?MYSQL_DEFAULTS_FILE is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${LOG_DIR:?LOG_DIR is required}"

SCHEDULER_LOG="${LOG_DIR}/daily_scheduler.log"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
NGINX_LOG_DIR="${NGINX_LOG_DIR:-/var/log/nginx}"
NGINX_LOG_RETENTION_DAYS="${NGINX_LOG_RETENTION_DAYS:-15}"
APP_LOG="${APP_LOG:-${LOG_DIR}/api.log}"
APP_LOG_MAX_MB="${APP_LOG_MAX_MB:-100}"
API_HEALTH_URL="${API_HEALTH_URL:-http://127.0.0.1:8080}"
DISK_USAGE_LIMIT="${DISK_USAGE_LIMIT:-90}"

if [[ "${1:-}" == "--dry-run" ]]; then
    printf 'mysqldump --defaults-extra-file=%q --no-tablespaces %q\n' "$MYSQL_DEFAULTS_FILE" "$DB_NAME"
    exit 0
fi

# 创建必要目录
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# 日志输出函数
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$SCHEDULER_LOG"
}
log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$SCHEDULER_LOG"
}
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$SCHEDULER_LOG"
}

log_info "==================== 开始执行每日全链路调度任务 ===================="

# ----------------- 2. 数据库备份与清理 (链路1) -----------------
log_info ">>> [链路 1] 开始执行 MySQL 数据库逻辑备份..."
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_auto_$(date +%Y%m%d_%H%M%S).sql.gz"

# 凭据只从权限为 0600 的 MySQL defaults 文件读取，不暴露在进程参数中
mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --no-tablespaces "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_info "数据库备份成功。文件保存至: $BACKUP_FILE"
else
    log_error "数据库备份失败！请检查 MySQL 状态或磁盘空间！"
fi

# 清理超过保留期的旧备份
log_info "清理 ${BACKUP_RETENTION_DAYS} 天以前的旧备份文件..."
find "$BACKUP_DIR" -mtime "+$BACKUP_RETENTION_DAYS" -name "${DB_NAME}_auto_*.sql.gz" -exec rm -f {} \;
log_info "旧备份清理完成。"


# ----------------- 3. 日志归档与清理 (链路2) -----------------
log_info ">>> [链路 2] 开始归档后端及 Web 服务器日志..."

if [ -d "$NGINX_LOG_DIR" ]; then
    # 压缩 Nginx 昨天的日志
    find "$NGINX_LOG_DIR" -mtime +1 -name "*.log" -exec gzip {} \;
    # 删除超过 15 天的 Nginx 历史日志
    find "$NGINX_LOG_DIR" -mtime "+$NGINX_LOG_RETENTION_DAYS" -name "*.gz" -exec rm -f {} \;
    log_info "Nginx 日志归档与过期清理完成。"
fi

# 检查 Spring Boot 日志大小并进行阶段性清理 (若配有本地文件输出)
if [ -f "$APP_LOG" ]; then
    # 如果日志文件大于 100M，进行重命名并压缩
    LOG_SIZE=$(du -m "$APP_LOG" | cut -f1)
    if [ "$LOG_SIZE" -gt "$APP_LOG_MAX_MB" ]; then
        mv "$APP_LOG" "${APP_LOG}_$(date +%Y%m%d_%H%M%S)"
        gzip "${APP_LOG}_*"
        log_info "检测到后端日志大于 100MB，已完成归档压缩。"
    fi
fi


# ----------------- 4. 核心服务状态健康检查与自动拉起 (链路3) -----------------
log_info ">>> [链路 3] 开始对全栈服务进行健康检查..."

# A. 检查 MySQL 运行状态
systemctl is-active --quiet mysqld
if [ $? -ne 0 ]; then
    log_warn "检测到 MySQL 服务处于宕机状态！尝试自动拉起..."
    systemctl restart mysqld
    sleep 3
    systemctl is-active --quiet mysqld && log_info "MySQL 重启成功！" || log_error "MySQL 重启失败，请管理员手动干预！"
else
    log_info "MySQL 服务运行正常。"
fi

# B. 检查 Redis 运行状态
systemctl is-active --quiet redis
if [ $? -ne 0 ]; then
    log_warn "检测到 Redis 服务处于宕机状态！尝试自动拉起..."
    systemctl restart redis
    sleep 3
    systemctl is-active --quiet redis && log_info "Redis 重启成功！" || log_error "Redis 重启失败，请管理员手动干预！"
else
    log_info "Redis 服务运行正常。"
fi

# C. 检查 Spring Boot (Port 8080) 运行状态
curl -s -o /dev/null --connect-timeout 5 "$API_HEALTH_URL"
if [ $? -ne 0 ]; then
    log_warn "检测到 Spring Boot 后端无响应或已停止！尝试自动重启..."
    systemctl restart yashe-api
    sleep 5
    curl -s -o /dev/null --connect-timeout 5 "$API_HEALTH_URL" && log_info "Spring Boot 后端重启成功！" || log_error "Spring Boot 重启失败，请检查 jar 日志！"
else
    log_info "Spring Boot 后端服务正常运行。"
fi

# D. 检查 Nginx (Port 8000/80) 运行状态
nginx -t > /dev/null 2>&1
if [ $? -ne 0 ]; then
    log_error "Nginx 配置文件存在语法错误，跳过自愈，请管理员核对配置文件！"
else
    systemctl is-active --quiet nginx
    if [ $? -ne 0 ]; then
        log_warn "检测到 Nginx 服务宕机！尝试重启..."
        systemctl restart nginx
        sleep 2
        systemctl is-active --quiet nginx && log_info "Nginx 重启成功！" || log_error "Nginx 重启失败！"
      else
          log_info "Nginx 服务运行正常。"
      fi
fi


# ----------------- 5. 系统磁盘与物理资源预警 (链路4) -----------------
log_info ">>> [链路 4] 开始检查系统物理资源水位..."

# A. 磁盘剩余空间检查
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt "$DISK_USAGE_LIMIT" ]; then
    log_error "【警告】服务器系统盘占用率已达 $DISK_USAGE%，超过 ${DISK_USAGE_LIMIT}% 安全水位，请及时清理文件！"
else
    log_info "系统盘占用率为 $DISK_USAGE%，处于安全区间。"
fi

# B. 内存占用状态记录
FREE_MEM=$(free -m | awk '/Mem:/ {print $4}')
log_info "当前系统可用空闲内存为: ${FREE_MEM}MB"

log_info "==================== 每日全链路调度任务执行完毕 ===================="
