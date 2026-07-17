# 雅舍 Atelier des Miyabi — 室内设计服务平台

本仓库是 **“雅舍 (Atelier des Miyabi)”** 室内设计展示与会员管理系统的完整代码库，包含前后端源码、数据库脚本、自动化部署配置及全套服务器运维文档。

---

## 📂 项目目录结构说明

```text
yashe/
├── api/                  # 后端项目 (Spring Boot 3.2.0 + Java 17 + MyBatis)
├── view/                 # 前端项目 (Vite + React 18 + TypeScript + Lucide icons)
├── sql/                  # 数据库初始化脚本目录
│   └── init.sql          # 数据库基础建表结构与虚构的初始化数据
├── DOC/                  # 📚 服务器部署与日常运维文档汇总
│   ├── deployment_preparation_guide.md  # 1. 服务部署实施指南
│   ├── github_secrets_guide.md          # 2. GitHub CI/CD 密钥配置指南
│   ├── db_maintenance_guide.md          # 3. 数据库备份与恢复指南
│   └── server_operations_runbook.md     # 4. 服务器日常运维操作手册
└── scripts/              # ⚙️ 自动化运维脚本目录
    └── yashe_daily_scheduler.sh        # 全链路自动调度与服务自愈脚本
```

---

## 👥 开发协作规范

### 1. 分支与合并流程
> [!IMPORTANT]
> **禁止直接向主分支（`master`）提交代码。** 每次改动须：
1. 从主分支检出新功能/修复分支并提交（Commits 仅落在该分支上）
2. 推送远程分支后申请合并（Pull Request / Merge Request）
3. 经审核通过后再合并进主分支

### 2. Commit 规范
所有 Commits 均须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。格式示例：
```text
<type>: <简短描述>
```

部分 `type` 含义速览：

| type | 含义 |
| :--- | :--- |
| `build` | 影响构建系统或外部依赖项的更改（如：npm, maven） |
| `ci` | 对 CI 配置文件和脚本的更改（如 deploy.yml 等） |
| `chore` | 修改杂物，比如 `.gitignore` |
| `docs` | 仅更改文档 |
| `feat` | 新增功能 |
| `fix` | 缺陷修复 |
| `perf` | 性能优化的代码更改 |
| `refactor` | 既不修复错误也不添加功能的代码更改（重构） |
| `style` | 不影响代码含义的更改（空格、格式、缺少分号等） |
| `test` | 添加缺失的测试或纠正现有的测试 |
| `revert` | 回退以前的 commit |

*示例*：
```text
feat: 增加管理员后台会员列表筛选
fix: 修复登录后 token 未写入 localStorage
docs: 补充部署与提交规范说明
```

### 3. 敏感数据规范

- 禁止提交真实账号密码、访问令牌、SSH 私钥、生产服务器地址及个人身份信息。
- 禁止提交生产数据库转储、备份文件或包含真实用户数据的测试数据。
- 本地与生产配置必须通过未跟踪的环境文件或密钥管理服务注入；仓库仅保留明确的占位符示例。
- 提交前须运行仓库安全检查：`powershell -NoProfile -File scripts/check_repository_security.ps1`。

---

## 📚 部署与运维文档汇总 (点击跳转)

为了方便开发团队与运维人员维护服务器，我们整理了全套的实操文档，您可直接点击下方链接进行阅读和查阅：

### 1. [🚀 阿里云服务部署与实施指南](file:///D:/CTEXT/实习/yashe/DOC/deployment_preparation_guide.md)
* **简介**：详细阐述了如何在阿里云 ECS 原生（Native）环境下安装与配置 Java 17、MySQL 8.0、Redis 与 Nginx，配置 Nginx 动静分离反向代理，以及在备案期间通过 `8000` 端口和 hosts 欺骗进行联调的合规过渡方案。

### 2. [⚙️ GitHub Actions 自动化部署 Secrets 配置指南](file:///D:/CTEXT/实习/yashe/DOC/github_secrets_guide.md)
* **简介**：指导如何为 GitHub 流水线配置机器专属的 Deploy Key（免密 SSH 登录钥对），并在 GitHub 仓库的 Secrets 中加密配置 `SERVER_IP`、`SERVER_USER`、`SERVER_PORT` 与 `SERVER_KEY`，实现安全地“推送代码即自动部署”。

### 3. [💾 MySQL 数据库日常运维与备份恢复指南](file:///D:/CTEXT/实习/yashe/DOC/db_maintenance_guide.md)
* **简介**：提供了关于本地 MySQL 数据库 `yashe_db` 的手动备份与恢复指令、自动化定时备份脚本以及数据库碎片整理、读写性能监控的常用 SQL 操作。

### 4. [🛠️ 阿里云服务器日常运维操作手册 (Runbook)](file:///D:/CTEXT/实习/yashe/DOC/server_operations_runbook.md)
* **简介**：全栈运维速查手册。内置了 MySQL 与 Redis 的安全强密码，包含了排查系统卡顿的硬件负载命令（CPU、内存、IO）、全栈服务进程启停命令、Nginx 流量分析与 SSH 安全防爆破审计命令。

---

## ⚙️ 核心运维脚本说明

* **[yashe_daily_scheduler.sh](file:///D:/CTEXT/实习/yashe/scripts/yashe_daily_scheduler.sh)**：
  配置在服务器 `crontab` 每日凌晨 3:00 运行的脚本。能一键串联数据库备份、日志滚动压缩与过期清理、系统资源红线检测，以及自动检测并重启宕机服务（MySQL/Redis/Tomcat/Nginx）的健康自愈。

---

## 📅 项目更新与优化记录 (Changelog)

#### **2026-07-17 (当前更新)**
* 🚀 **部署架构解耦与优化**：
  * 对齐团队最新部署规划：前端准备托管至 **Cloudflare Pages**，后端 API 保持在 **阿里云 ECS** 上运行。
  * 将后端配置由传统的外部 YAML 加载，重构成更易管理、符合云原生安全的 **`.env` 环境变量文件**。微调 Systemd 服务通过 `EnvironmentFile` 指令自动读取环境配置。
* 💾 **自动化数据库备份与自愈**：
  * 编写了全链路自动调度脚本 `yashe_daily_scheduler.sh`。
  * 修复了 MySQL 8.0 普通用户缺乏全局 `PROCESS` 权限导致 `mysqldump` 备份表空间失败的报错（添加了 `--no-tablespaces` 参数）。
* 🛠️ **文档规范化重构**：
  * 建立了统一的 `DOC/` 归档文件夹，移除了根目录下临时散落的 Markdown 文件。
  * 重构了项目 [README.md](file:///D:/CTEXT/实习/yashe/README.md) 主页，整合了团队的分支合并与 Commit 提交规范，并生成了全套文档的快捷跳转。
* 🐛 **流水线与仓库配置优化**：
  * 修正了 `.github/workflows/deploy.yml` 构建触发分支，由 `main` 更改为本仓库实际的默认主分支 `master`。
  * 在根目录 `.gitignore` 中追加了 `.worktrees/` 规则，防止开发中的本地 worktree 零散文件被误提交。
