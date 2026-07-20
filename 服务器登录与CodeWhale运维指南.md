# 雅舍服务器登录与 CodeWhale 运维指南


| 项目   | 内容                                    |
| ---- | ------------------------------------- |
| 文档类型 | 服务器登录、日常运维与 CodeWhale 辅助使用指南          |
| 适用对象 | 非专职运维、实习同学、需要偶尔上服务器的同事                |
| 适用环境 | 阿里云 ECS + 雅舍（admys.cn / api.admys.cn） |
| 辅助工具 | CodeWhale（已可安装在服务器，用于解释命令、巡检、写脚本）     |
| 文档版本 | V1.0                                  |
| 编制日期 | 2026-07-20                            |


## 修订历史


| 日期         | 版本   | 修订内容                               | 修订人  |
| ---------- | ---- | ---------------------------------- | ---- |
| 2026-07-20 | V1.0 | 初稿：SSH 密钥、登录、CodeWhale、巡检、定时任务与提示词 | 运维文档 |


---

## 0  先读这 2 分钟：你会用到什么

可以把服务器理解成一台**放在机房里、7×24 开机的电脑**。你平时用自己的笔记本，通过「远程钥匙」（SSH 密钥）登录它，再查看网站后台服务是否正常。


| 名词        | 大白话                                |
| --------- | ---------------------------------- |
| SSH       | 安全远程登录协议，像「加密的远程桌面命令行版」            |
| 公钥 / 私钥   | 公钥像门锁，私钥像钥匙。门锁可以挂在服务器上，钥匙只留在你自己电脑  |
| root      | 超级管理员账号，权限很大，操作要格外小心               |
| systemd   | Linux 里管理服务开机/启停的「总管家」             |
| Nginx     | 网站的门卫与前台，对外接收 80/443 访问            |
| yashe-api | 雅舍后端 API 服务（Java）                  |
| CodeWhale | 装在服务器上的 AI 终端助手，可帮你解释日志、写巡检命令、提醒风险 |


**铁律（请背下来）：**

1. **私钥永远不要发给别人，也不要贴到聊天、截图、Git 仓库。**
2. **不确定的命令先问 CodeWhale「这是做什么的、有没有破坏性」，确认后再执行。**
3. **生产环境默认只做「查看」，不要随便重启、删文件、改密码。**
4. **API Key、数据库密码不要写进公开文档。**

> CodeWhale 能辅助什么？  
> 你可以把本指南里的任何一段命令贴给它，说：「用大白话解释，并告诉我执行前要检查什么。」  
> 也可以把报错日志贴给它，说：「这是故障还是扫描噪音？下一步只读检查命令是什么？」

---

## 1  你需要准备什么

### 1.1  信息清单（自己私下保管）


| 信息               | 示例 / 说明                                   | 存放位置建议                     |
| ---------------- | ----------------------------------------- | -------------------------- |
| 服务器公网 IP         | 如 `8.x.x.x`（以阿里云控制台为准）                    | 密码管理器 / 团队保密表              |
| SSH 端口           | 通常 `22`                                   | 同上                         |
| 登录用户             | 当前可能是 `root`；长期建议改用非 root 运维账号            | 同上                         |
| 私钥文件路径           | 如 `C:\Users\你\.ssh\yashe_ed25519`         | 仅本机，权限收紧                   |
| DeepSeek API Key | `sk-...`（给 CodeWhale 用）                   | 仅服务器 `~/.codewhale/` 或环境变量 |
| 网站地址             | `https://admys.cn`、`https://api.admys.cn` | 可公开                        |


### 1.2  本机软件


| 系统      | 推荐工具                                                    |
| ------- | ------------------------------------------------------- |
| Windows | Windows Terminal + OpenSSH（Win10/11 一般自带）；或 Cursor 内置终端 |
| macOS   | 自带「终端」                                                  |
| 可选      | VS Code / Cursor 的 Remote-SSH 插件（图形化连服务器）               |


检查本机是否有 SSH：

```bash
ssh -V
```

能显示版本号即可。

---

## 2  从零签发 SSH 密钥（最重要）

### 2.1  为什么要用密钥，而不是密码

- 密码容易被猜、被撞库；公网每天都有人扫 SSH。
- 密钥登录：服务器只存「锁」（公钥），你电脑存「钥匙」（私钥）。
- 即使别人知道 IP，没有你的私钥也进不去。

### 2.2  在你自己的电脑上生成密钥（Windows PowerShell / macOS / Linux 通用）

打开本机终端，执行：

```bash
ssh-keygen -t ed25519 -C "你的名字-yashe-ops" -f ~/.ssh/yashe_ed25519
```

按提示操作：

1. **密码短语（passphrase）**：建议设置一个只有你知道的口令（私钥再加一层保护）。
2. 完成后会生成两个文件：
  - `~/.ssh/yashe_ed25519` → **私钥（绝对保密）**
  - `~/.ssh/yashe_ed25519.pub` → **公钥（可以放到服务器）**

查看公钥内容（以后要粘贴到服务器）：

```bash
# Windows PowerShell
Get-Content $env:USERPROFILE\.ssh\yashe_ed25519.pub

# macOS / Linux
cat ~/.ssh/yashe_ed25519.pub
```

> 用 CodeWhale 辅助：  
> 「解释 ssh-keygen 每个参数；如果我不小心把私钥提交到 GitHub 该怎么办？」

### 2.3  把公钥挂到服务器（装门锁）

你需要**已经有一种方式能先登录一次**（阿里云网页「远程连接」、或旧密钥）。登录后执行：

```bash
nano ~/.ssh/authorized_keys
```

把本机 `.pub` 文件里的**一整行**粘贴到文件末尾，保存退出（nano：`Ctrl+O` 回车，`Ctrl+X`）。

然后：

```bash
chmod 600 ~/.ssh/authorized_keys
```

### 2.4  在本机配置「一键登录别名」（强烈推荐，或之后通过ssh @root "服务器公网ip"）

编辑本机 SSH 配置：

```bash
# Windows
notepad $env:USERPROFILE\.ssh\config

# macOS / Linux
nano ~/.ssh/config
```

加入（把 IP、用户改成你的真实值）：

```sshconfig
Host yashe
  HostName 你的服务器公网IP
  User root
  Port 22
  IdentityFile ~/.ssh/yashe_ed25519
  IdentitiesOnly yes
```

之后登录只需：

```bash
ssh yashe
```

第一次会问是否信任主机指纹，输入 `yes`。

### 2.5  验证登录

```bash
ssh yashe
# 成功后应看到 Linux 命令提示符
hostname
whoami
date
exit
```

### 2.6  密钥安全管理清单

- [ ] 私钥只在本机，已设置 passphrase  
- [ ] 公钥已在服务器 `authorized_keys`  
- [ ] 未把私钥发到微信/邮件/仓库  
- [ ] 人员离职时：从 `authorized_keys` **删除**其公钥行  
- [ ] GitHub Actions 部署密钥：单独一把，不要和个人运维钥匙混用（见仓库 `DOC/github_secrets_guide.md`）

> CodeWhale 提示词：  
> 「审核我的 ~/.ssh/config（我粘贴脱敏后的内容）。有没有安全问题？如何改成非 root 用户登录更安全？」

---

## 3  第一次登上服务器：你会看到什么

登录成功后，先做三件「只看不动」的事：

```bash
# 1. 现在几点、机器跑了多久、忙不忙
date
uptime

# 2. 磁盘还剩多少
df -h /

# 3. 内存还剩多少
free -h
```

### 3.1  雅舍相关核心服务（记住这 4 个名字）


| 服务名         | 作用          | 日常状态命令                       |
| ----------- | ----------- | ---------------------------- |
| `nginx`     | 网站入口 / 反向代理 | `systemctl status nginx`     |
| `yashe-api` | 后端 API      | `systemctl status yashe-api` |
| `mysqld`    | 数据库         | `systemctl status mysqld`    |
| `redis`     | 缓存          | `systemctl status redis`     |


一次看四个是否在跑：

```bash
systemctl is-active nginx yashe-api mysqld redis
```

期望输出四行都是 `active`。

开机是否会自动启动：

```bash
systemctl is-enabled nginx yashe-api mysqld redis
```

期望尽量都是 `enabled`。（Nginx 已在 2026-07-20 开启自启。）

### 3.2  哪些端口正常

```bash
ss -lntp
```

只需关心：


| 正常现象                    | 含义              |
| ----------------------- | --------------- |
| `80` / `443` 由 nginx 监听 | 网站对外服务          |
| `8080` 只在 `127.0.0.1`   | API 不直接暴露公网（正确） |
| `6379` 只在 `127.0.0.1`   | Redis 本机可用（正确）  |
| `22` 为 sshd             | 远程登录            |


> CodeWhale 提示词：  
> 「我粘贴 ss -lntp 的输出。请指出哪些端口正常、哪些需要警惕，用表格说明。」

---

## 4  安装与运行 CodeWhale（服务器上的 AI 助手）

官方安装文档：[https://codewhale.net/zh/install](https://codewhale.net/zh/install)

### 4.1  安装（服务器已经安装，可以跳过）

以 root 安装到系统路径（全用户可用）：

```bash
curl -fsSL https://codewhale.net/install.sh | CODEWHALE_INSTALL_DIR=/usr/local/bin sh
```

验证：

```bash
codewhale --version
codewhale doctor
```

### 4.2  配置 API 密钥（第一次必做）

1. 在 DeepSeek 开放平台创建密钥（形如 `sk-...`）。
2. 在服务器执行（**不要**把真实密钥写进本文档）：

```bash
codewhale auth set --provider deepseek --api-key '这里粘贴你的sk密钥'
```

或：

```bash
codewhale
```

打开codewhale页面之后按照提示进行，进入codewhale对话界面，可正常对话及成功。

### 4.3  日常怎么启动 CodeWhale

```bash
codewhale
```

模式说明（以官方说明为准，界面可能随版本略有差异）：


| 模式          | 适合做什么          | 风险         |
| ----------- | -------------- | ---------- |
| Plan / 只读调查 | 看日志、解释、给命令清单   | 低          |
| Agent       | 可执行工具，重要操作需你批准 | 中          |
| YOLO / 自动批准 | 自动执行           | **高，生产慎用** |


**生产环境建议：默认用 Plan/只读；确需改配置再切 Agent，并逐条批准。**

### 4.4  CodeWhale 配置大概在哪

```text
~/.codewhale/
├── config.toml      # 密钥、模型等
├── mcp.json         # MCP（可选）
├── skills/          # 技能（可选）
├── sessions/        # 会话
└── audit.log        # 审计
```

> CodeWhale 自助提示词：  
> 「用 doctor 的结果告诉我还缺什么。按优先级列出我今天必须完成的 3 件事。」

---

## 5  服务器运维专用提示词（直接复制给 CodeWhale）

下面提示词专为「普通人 + 生产只读优先」设计。把输出里的 `<粘贴内容>` 换成真实日志即可。

### 5.1  通用安全前缀（每次都可加上）

```text
你是生产服务器运维助手。约束：
1. 默认只给只读命令；任何会修改配置、删除文件、重启服务、改权限的操作，必须单独标注【写操作】并说明风险。
2. 不要索要或回显私钥、数据库密码、API Key 明文。
3. 先给结论（正常/异常/不确定），再给分步命令。
4. 命令要可复制，一行一条，并说明期望输出长什么样。
```

### 5.2  每日 5 分钟巡检

```text
【通用安全前缀】
请生成「雅舍生产机每日 5 分钟巡检」命令清单，覆盖：
uptime/负载、内存、磁盘、nginx/yashe-api/mysqld/redis 是否 active、
最近 nginx error 尾部、yashe-api 今天是否有异常关键字。
按执行顺序编号。我执行后把输出贴回来，请你判定是否健康。
```

### 5.3  解读一段报错

```text
【通用安全前缀】
以下是服务器日志片段：
<粘贴日志>
请判断：A 业务故障 / B 扫描噪音 / C 配置问题 / D 需要更多信息。
给出下一步只读命令，不要直接建议重启，除非证据充分。
```

### 5.4  服务挂了怎么办（先诊断）

```text
【通用安全前缀】
网站打不开。已知栈：Nginx + yashe-api + MySQL + Redis。
请给出从外到内的排查顺序（浏览器 → DNS/CDN → Nginx → API → DB）。
每一步给 1～2 条只读命令。只有确认某服务 down 时，才给出【写操作】重启命令，并说明重启影响。
```

### 5.5  写巡检脚本（让 CodeWhale 起草，你审查后安装）

```text
【通用安全前缀】
请写一个 bash 巡检脚本，输出到 /var/log/yashe-daily-check.log：
检查 disk、memory、四服务 active、nginx 最近 5xx 粗计数。
要求：失败时 exit 1；不要包含密码；兼容 Alibaba Cloud Linux。
先给出完整脚本内容，等我确认后再告诉我如何用 crontab 安装。
```

### 5.6  讲解命令（学习模式）

```text
我是新手。请解释下面这条命令每个部分的意思，以及误用会造成什么后果：
systemctl restart yashe-api
```

### 5.7  安全加固咨询（只出方案，不擅自改）

```text
【通用安全前缀】
当前 MySQL 监听 *:3306，宝塔 8888 监听 0.0.0.0，但安全组可能已拦截。
请给出「收紧监听」的分步方案与回滚方法，标明每一步【写操作】风险。
在我明确说「执行」之前，不要生成会直接改配置的一键脚本。
```

---

## 6  日常巡检工作（你可以照着做）

建议：**每个工作日上午 1 次**；发版当天加做 1 次。

### 6.1  浏览器侧（1 分钟）

- [ ] 打开 `https://admys.cn` 是否正常  
- [ ] 打开 `https://api.admys.cn`（可能无首页，但不应整站超时）  
- [ ] 如有管理后台，试一次登录页能否打开  

### 6.2  SSH 侧标准清单（4～8 分钟）

```bash
ssh yashe

date
uptime
free -h
df -h /

systemctl is-active nginx yashe-api mysqld redis
systemctl is-enabled nginx yashe-api mysqld redis

# API 今天有没有明显异常关键字（有输出再贴给 CodeWhale）
journalctl -u yashe-api --since today --no-pager | grep -E 'ERROR|Exception|OutOfMemory' | tail -n 30

# Nginx 最近错误（大量 /.env 扫描通常可忽略）
tail -n 40 /var/log/nginx/error.log
```

### 6.3  如何判断「要不要慌」


| 现象                         | 通常含义      | 你该做什么                                                 |
| -------------------------- | --------- | ----------------------------------------------------- |
| `is-active` 全是 active，负载很低 | 健康        | 记录「正常」即可                                              |
| error.log 里大量 `/.env` 404  | 公网扫描噪音    | 可忽略；可问 CodeWhale 确认                                   |
| `yashe-api` 不是 active      | 后端挂了      | 先 `journalctl -u yashe-api -n 100 --no-pager`，再决定是否重启 |
| 磁盘超过 85%                   | 日志/备份占满风险 | 查大目录，清理前先问 CodeWhale                                  |
| 内存 available 很低且 Swap 很高   | 内存压力      | 观察是否持续；发版后重点盯                                         |
| 网站 5xx                     | 网关或后端错误   | 对照 nginx access/error 与 api journal                   |


巡检结果可记在：`DOC/admys_服务器日志巡检摘要.md`（已有模板）。

> 做完巡检后对 CodeWhale 说：  
> 「以下是我今天的巡检输出：`<粘贴>`。请用表格给出：状态、风险、是否需要人工跟进。」

### 6.4  允许的日常写操作（需谨慎）

仅在确认服务异常且只读排查完成后：

```bash
# 示例：重启 API（会短暂中断接口）
sudo systemctl restart yashe-api
sudo systemctl status yashe-api --no-pager
```

重启前先问 CodeWhale：

```text
我准备重启 yashe-api。请确认：重启会影响什么？回滚/再检查命令是什么？有没有比重启更优先的只读步骤我还没做？
```

---

## 7  定时脚本与自动巡检

### 7.1  什么是 crontab

crontab 是 Linux 的「闹钟」：到点自动跑脚本。  
雅舍仓库里已有运维调度思路（如 `scripts/yashe_daily_scheduler.sh`，用于备份/自愈等），下面给一个**更轻量的健康检查示例**，适合普通人先用。

### 7.2  示例：每日健康检查脚本

在服务器创建文件（路径可自定）：

```bash
sudo mkdir -p /usr/local/sbin
sudo nano /usr/local/sbin/yashe-health-check.sh
```

写入：

```bash
#!/bin/bash
# 雅舍轻量健康检查 - 只读为主，失败时返回非 0
set -euo pipefail

LOG="/var/log/yashe-health-check.log"
ts() { date '+%F %T'; }

{
  echo "===== $(ts) health check start ====="
  uptime
  free -h
  df -h /
  echo "-- services --"
  for s in nginx yashe-api mysqld redis; do
    st=$(systemctl is-active "$s" || true)
    echo "$s=$st"
    if [ "$st" != "active" ]; then
      echo "ERROR: $s not active"
      exit 1
    fi
  done
  echo "-- api recent errors (if any) --"
  journalctl -u yashe-api --since "24 hours ago" --no-pager 2>/dev/null \
    | grep -E 'OutOfMemory|ERROR' \
    | tail -n 20 || true
  echo "===== $(ts) health check ok ====="
} | tee -a "$LOG"
```

保存后：

```bash
sudo chmod 755 /usr/local/sbin/yashe-health-check.sh
sudo /usr/local/sbin/yashe-health-check.sh
```

### 7.3  挂到定时任务（每天早上 9:00）

```bash
sudo crontab -e
```

加入一行：

```cron
0 9 * * * /usr/local/sbin/yashe-health-check.sh >> /var/log/yashe-health-check.cron.log 2>&1
```

含义：每天 09:00 执行一次。

查看是否安装成功：

```bash
sudo crontab -l
```

查看历史输出：

```bash
tail -n 50 /var/log/yashe-health-check.log
```

### 7.4  用 CodeWhale 维护定时任务

```text
【通用安全前缀】
这是我的 crontab -l 输出：
<粘贴>
请解释每行含义；有没有危险任务；如何备份/恢复 crontab。
```

```text
请帮我改进 yashe-health-check.sh：增加「若服务 down 则把 systemctl status 追加进日志」，仍然不要自动 restart。
```

### 7.5  与现有「重型」调度脚本的关系


| 类型                            | 用途            | 建议            |
| ----------------------------- | ------------- | ------------- |
| 轻量 `yashe-health-check.sh`    | 每天看一眼活着没      | 适合所有人         |
| 仓库 `yashe_daily_scheduler.sh` | 备份、日志清理、自愈重启等 | 需理解后再启用；改前先备份 |


**不要**在没读懂脚本前，把「自动重启一切」的逻辑打开。自愈很方便，也可能在故障时掩盖根因。

---

## 8  常见场景速查

### 8.1  我进不去服务器了

1. 确认本机网络、IP 是否变了（看阿里云控制台）。
2. 确认用的是正确私钥：`ssh -i ~/.ssh/yashe_ed25519 root@IP`。
3. 用阿里云「远程连接」网页急救。
4. 检查本机 `~/.ssh/config` 是否写错用户/路径。

### 8.2  网站打不开，但 SSH 正常

```bash
systemctl is-active nginx yashe-api
systemctl status nginx --no-pager --lines=30
systemctl status yashe-api --no-pager --lines=30
tail -n 50 /var/log/nginx/error.log
```

把输出交给 CodeWhale 用「5.4 服务挂了」提示词。

### 8.3  看到很多 `/.env` 报错

多数是黑客扫描，不是你们网站真丢了 `.env`。  
若同时出现 `access forbidden by rule`，说明拦截在生效。  
仍建议：**永远不要把真实** `.env` **放在网站可下载目录。**

### 8.4  想更新 CodeWhale

```bash
codewhale update
# 或询问codewhale帮忙
curl -fsSL https://codewhale.net/install.sh | CODEWHALE_INSTALL_DIR=/usr/local/bin sh
codewhale --version
```

---

## 9  安全与合规红线

1. 生产库、`.env`、私钥、API Key **禁止**提交 Git。
2. 不要把生产密码发到群聊；需要协作时用公司批准的密钥管理方式。
3. 长期应用非 root 账号做日常运维；root 仅紧急使用。
4. 阿里云安全组：对外只放行必要端口（通常 22/80/443）。
5. 变更前先写清楚：改什么、为什么、如何回滚。
6. CodeWhale YOLO 模式不要用于生产盲改。

> CodeWhale 提示词：  
> 「把下面操作当成变更评审：`<你的计划>`。列出风险、回滚、验证步骤。如果风险高，直接劝我不要做。」

---

## 10  推荐学习路径（普通人 3 天）

### 第 1 天：能登录、能看状态

- [ ] 生成本机密钥并配置 `Host yashe`  
- [ ] 独立完成一次 `ssh yashe`  
- [ ] 跑通 `systemctl is-active ...` 四服务检查  

### 第 2 天：会用 CodeWhale 当教练

- [ ] `codewhale doctor` 全绿到「有 API Key」  
- [ ] 用「每日巡检」提示词生成清单并实操  
- [ ] 把一段 nginx error 交给它分类  

### 第 3 天：自动化与记录

- [ ] 安装轻量 `yashe-health-check.sh` + crontab  
- [ ] 在巡检摘要文档记一笔「今日正常/异常」  
- [ ] 阅读仓库 `DOC/server_operations_runbook.md` 加深  

---

## 11  相关文档索引


| 文档                                                                   | 用途                       |
| -------------------------------------------------------------------- | ------------------------ |
| 本文件                                                                  | 登录 + CodeWhale + 日常巡检总入口 |
| `DOC/server_operations_runbook.md`                                   | 更全的命令速查                  |
| `DOC/github_secrets_guide.md`                                        | 部署密钥与 GitHub Secrets     |
| `DOC/db_maintenance_guide.md`                                        | 数据库备份恢复                  |
| `DOC/deployment_preparation_guide.md`                                | 部署与环境准备                  |
| `DOC/admys_服务器日志巡检摘要.md`                                             | 已做过的生产巡检记录               |
| `DOC/admys_商用网站完整测试计划.md`                                            | 上线前测试清单                  |
| [README.md](README.md)                                               | 项目入口与全部文档索引              |
| [https://codewhale.net/zh/install](https://codewhale.net/zh/install) | CodeWhale 官方安装           |


---

## 12  附录：一张纸版「救命卡片」

```text
登录：        ssh yashe
四服务：      systemctl is-active nginx yashe-api mysqld redis
看 API 日志： journalctl -u yashe-api -n 100 --no-pager
看 Nginx：    tail -n 50 /var/log/nginx/error.log
资源：        uptime && free -h && df -h /
AI 助手：     codewhale
更新助手：    codewhale update
```

**给 CodeWhale 的一句总提示：**

```text
【通用安全前缀】我是雅舍站点运维新手，服务器是阿里云 Linux，服务为 nginx/yashe-api/mysqld/redis。
请一直用大白话，优先只读命令，写操作必须标风险并等我确认。
```

---

**文档版本：** V1.0  
**编制日期：** 2026-07-20  
**使用建议：** 把本文和 CodeWhale 一起用——本文给流程，CodeWhale 给解释与临场判断。