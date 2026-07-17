#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
script="$repo_root/scripts/yashe_daily_scheduler.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

assert_fails() {
    local expected=$1
    shift
    local output
    if output=$("$@" 2>&1); then
        echo "expected command to fail" >&2
        exit 1
    fi
    [[ "$output" == *"$expected"* ]] || {
        echo "expected failure containing: $expected" >&2
        echo "$output" >&2
        exit 1
    }
}

assert_fails "maintenance config unreadable" \
    env YASHE_MAINTENANCE_ENV="$tmp/missing.env" bash "$script" --dry-run

cat > "$tmp/incomplete.env" <<EOF
MYSQL_DEFAULTS_FILE=$tmp/mysql.cnf
EOF
chmod 600 "$tmp/incomplete.env"
assert_fails "DB_NAME is required" \
    env YASHE_MAINTENANCE_ENV="$tmp/incomplete.env" YASHE_SKIP_PERMISSION_CHECK=1 bash "$script" --dry-run

cat > "$tmp/maintenance.env" <<EOF
MYSQL_DEFAULTS_FILE=$tmp/mysql.cnf
DB_NAME=yashe_fixture
BACKUP_DIR=$tmp/backups
LOG_DIR=$tmp/logs
EOF
chmod 600 "$tmp/maintenance.env"

output="$(env YASHE_MAINTENANCE_ENV="$tmp/maintenance.env" YASHE_SKIP_PERMISSION_CHECK=1 bash "$script" --dry-run)"
[[ "$output" == *'mysqldump --defaults-extra-file='* ]] || {
    echo "dry-run must use MySQL defaults file" >&2
    exit 1
}
[[ "$output" != *' -p'* ]] || {
    echo "dry-run must not expose a password argument" >&2
    exit 1
}

echo "PASS: maintenance script fails closed and keeps credentials out of process arguments"
