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
├── DOC/                  # 📚 归档文档（部署、运维、巡检）
│   ├── deployment_preparation_guide.md  # 服务部署实施指南
│   ├── DEPLOYMENT.md                    # 上线准备清单（Cloudflare + ECS）
│   ├── github_secrets_guide.md          # GitHub CI/CD 密钥配置指南
│   ├── db_maintenance_guide.md          # 数据库备份与恢复指南
│   ├── server_operations_runbook.md     # 服务器日常运维操作手册
│   ├── admys_scan_report.md             # 安全扫描原始报告
│   └── admys_服务器日志巡检摘要.md       # 生产服务器日志巡检摘要
├── 服务器登录与CodeWhale运维指南.md     # 🌟 面向普通人的登录与运维入门（仓库根目录）
├── README.md             # 本文件：项目入口与文档索引
└── scripts/              # ⚙️ 自动化运维脚本目录
    ├── yashe_daily_scheduler.sh         # 全链路自动调度与服务自愈脚本
    └── check_repository_security.ps1    # 提交前本地密钥/敏感文件检查
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
- 已安装 Gitleaks 时同时运行：`gitleaks dir . --config .gitleaks.toml --redact --no-banner`。
- `.github/workflows/security.yml` 会在 Pull Request、`master` 推送和手动触发时扫描当前仓库快照；历史泄露另行人工审计，不通过把旧秘密加入允许列表来绕过。

上线前必须完成以下人工轮换，不能仅依赖代码脱敏：

- [ ] 撤销旧 SSH 公钥，创建非 root 部署密钥并更新 GitHub Secrets。
- [ ] 轮换 MySQL、Redis 和 JWT 密钥。
- [ ] 重启 API 并验证旧 JWT 已失效。
- [ ] 关闭临时公网测试端口并复核源站访问控制。

---

## 📚 文档索引（点击跳转）

> **仓库根目录只保留两份「入口文档」**：本 [README.md](README.md) 与 [服务器登录与CodeWhale运维指南.md](服务器登录与CodeWhale运维指南.md)。  
> 其余部署、运维、巡检文档统一归档在 `DOC/` 目录，通过下方链接访问。

### 🌟 普通人优先阅读

| 文档 | 适合谁 | 说明 |
| :--- | :--- | :--- |
| [服务器登录与 CodeWhale 运维指南](服务器登录与CodeWhale运维指南.md) | 非专职运维、实习同学 | SSH 密钥、登录、日常巡检、CodeWhale 提示词，大白话版 |
| [GitHub 仓库工作流说明（见下文）](#-github-仓库工作流说明普通人版) | 所有提交代码的人 | 怎么推送、怎么避免把密钥提交进仓库 |

### 🚀 部署与运维

| 文档 | 说明 |
| :--- | :--- |
| [阿里云服务部署与实施指南](DOC/deployment_preparation_guide.md) | ECS 环境安装 Java/MySQL/Redis/Nginx、动静分离与备案过渡方案 |
| [上线准备清单](DOC/DEPLOYMENT.md) | Cloudflare Pages + ECS 环境变量与上线检查项 |
| [GitHub Actions Secrets 配置指南](DOC/github_secrets_guide.md) | 部署密钥、服务器连接信息的 GitHub Secrets 配置步骤 |
| [MySQL 数据库备份与恢复指南](DOC/db_maintenance_guide.md) | 手动/自动备份、恢复与性能监控 SQL |
| [服务器日常运维操作手册 (Runbook)](DOC/server_operations_runbook.md) | 负载排查、服务启停、Nginx 日志分析、SSH 安全审计 |
| [安全扫描原始报告](DOC/admys_scan_report.md) | 首轮安全扫描原始记录 |
| [服务器日志巡检摘要](DOC/admys_服务器日志巡检摘要.md) | 生产环境 Nginx/API 日志只读巡检结论 |

---

## 🔄 GitHub 仓库工作流说明（普通人版）

可以把 GitHub 理解成「代码的网盘 + 自动打包发货机器」。本项目的完整流程如下：

```text
你在本地改代码
    ↓
git add / git commit（只提交到功能分支，不直接改 master）
    ↓
git push 到 GitHub
    ↓
GitHub Actions 自动运行两条流水线：
  ① Repository Security — 扫描有没有密钥/密码被误提交
  ② Build and Deploy     — 编译前后端并部署到阿里云（仅 master 分支）
    ↓
合并进 master 后，线上网站自动更新
```

### 第一步：日常改代码（功能分支）

**不要直接在 `master` 上改。** 正确做法：

```bash
# 1. 确保本地是最新的 master
git checkout master
git pull

# 2. 新建功能分支（名字自己起，见名知意）
git checkout -b fix/contact-form-validation

# 3. 改完代码后提交
git add .
git commit -m "fix: 修复联系表单字数校验"

# 4. 推送到 GitHub（第一次推送要带 -u）
git push -u origin fix/contact-form-validation
```

然后在 GitHub 网页上发起 **Pull Request（合并请求）**，请同事审核后再合并进 `master`。

### 第二步：提交前必做——防止密钥进仓库

> **一句话原则：仓库里只放代码和示例，真实密码/密钥只放 GitHub Secrets 或服务器 `.env`，永远不要写进代码文件。**

| ❌ 绝对不能提交 | ✅ 正确做法 |
| :--- | :--- |
| SSH 私钥文件（`id_rsa`、`id_ed25519` 等） | 私钥只留在本机；公钥放服务器；部署私钥放 GitHub Secrets 的 `SERVER_KEY` |
| 数据库真实密码 | 写在服务器 `/etc/yashe/api.env`，仓库只保留 `api/.env.example` 占位符 |
| JWT 密钥（`YASHE_JWT_SECRET`） | 写在服务器环境变量，不要写进 `application.yml` 或任何 `.md` |
| Turnstile Secret Key | 后端放服务器环境变量；前端 Site Key 放 GitHub Variables 的 `TURNSTILE_SITE_KEY` |
| 真实用户数据、数据库备份 `.sql` | 备份文件放服务器本地，不进 Git |
| 服务器 IP + root 密码写在 README 里 | 服务器信息只放 GitHub Secrets |

**提交前在 Windows 本地运行安全检查：**

```powershell
powershell -NoProfile -File scripts/check_repository_security.ps1
```

如果报错，说明你的改动里可能含有密钥或敏感文件，**先删掉再提交**。

### 第三步：GitHub Actions 会自动做什么

打开 GitHub 仓库 → 顶部 **Actions** 标签，可以看到两类任务：

#### ① Repository Security（安全扫描）

- **什么时候跑**：每次 Pull Request、每次推送到 `master`、或手动触发
- **做什么**：用脚本 + Gitleaks 扫描当前代码快照，检查是否误提交了私钥、数据库密码、JWT 密钥等
- **你看到红灯怎么办**：点进失败的任务，看报错文件名和行号，把敏感内容从代码里删掉，重新 push

#### ② Build and Deploy to Alibaba Cloud（自动部署）

- **什么时候跑**：仅当代码 **push 到 `master` 分支** 时
- **做什么**：
  1. 编译后端 Java → 生成 JAR 包
  2. 编译前端 React → 生成静态文件（会注入 `TURNSTILE_SITE_KEY`）
  3. 通过 SCP 上传到阿里云服务器
  4. SSH 远程执行 `systemctl restart yashe-api` 重启后端
- **需要的密钥在哪**：GitHub → Settings → Secrets and variables → Actions → Secrets 里配置了 `SERVER_IP`、`SERVER_USER`、`SERVER_PORT`、`SERVER_KEY`（详见 [Secrets 配置指南](DOC/github_secrets_guide.md)）
- **你看到绿灯**：说明最新代码已成功部署到生产服务器

### 第四步：哪些文件「可以提交、哪些不行」

| 文件类型 | 能否提交 | 说明 |
| :--- | :---: | :--- |
| `.java` / `.tsx` / `.css` 源码 | ✅ | 正常业务代码 |
| `api/.env.example` / `view/.env.example` | ✅ | 只有占位符，没有真实值 |
| `api/.env` / `view/.env` | ❌ | 已在 `.gitignore` 中，含真实配置 |
| `sql/init.sql` | ✅ | 只有建表结构和虚构数据 |
| `sql/yashe_db_*.sql` 备份 | ❌ | 含真实用户数据 |
| `*.pem` / `id_ed25519` 私钥 | ❌ | 绝对禁止 |
| `DOC/*.md` 文档 | ✅ | 文档里用 `<占位符>` 代替真实值 |
| `scripts/*.sh` / `*.ps1` | ✅ | 运维脚本（不含密码） |

### 第五步：不小心提交了密钥怎么办

1. **立刻**在对应平台轮换（作废）该密钥：数据库改密码、JWT 重新生成、SSH 密钥重新签发
2. 从 Git 历史中删除该文件（需开发人员协助，或用 `git filter-repo`）
3. 绝不要「把旧密钥加入白名单」来绕过扫描——那是掩盖问题，不是解决问题

> 更详细的 Secrets 配置步骤见 [GitHub Actions Secrets 配置指南](DOC/github_secrets_guide.md)。

---

## ⚙️ 核心运维脚本说明

* **[yashe_daily_scheduler.sh](scripts/yashe_daily_scheduler.sh)**：
  配置在服务器 `crontab` 每日凌晨 3:00 运行的脚本。能一键串联数据库备份、日志滚动压缩与过期清理、系统资源红线检测，以及自动检测并重启宕机服务（MySQL/Redis/Tomcat/Nginx）的健康自愈。

---

## 📅 项目更新与优化记录 (Changelog)

#### **2026-07-20 — 关于我们营业执照与运维文档**
* 🏅 **荣誉与资质**：关于我们页底部新增居中展示的营业执照，复用证书灯箱。
* 📁 **文档结构**：`DEPLOYMENT.md` 归入 `DOC/`；根目录保留 README 与《服务器登录与 CodeWhale 运维指南》。
* 📖 **README 增强**：文档索引与面向普通人的 GitHub 工作流说明（分支规范、提交前安全检查、Actions 解读）。
* **维护人**：Si_Nan

#### **2026-07-17 — 安全整改、后台拆页与全站手机端优化**
* 🔐 **安全整改**：移除仓库中的私钥、真实数据库转储和明文凭据；集中校验 JWT 与数据库当前角色/状态；注册和联系表单接入 Turnstile；登录、注册、留言增加限流；收紧 CORS 与安全响应头。
* 📱 **手机端优化**：统一移动端页面边距、触控尺寸、导航抽屉、长文本换行和减少动态效果，完善 320px 起的页面布局。
* 🧭 **后台重构**：后台拆分为 `/admin/notifications` 通知推送页和 `/admin/users` 用户管理页，顶部展示“广州雅舍室内设计有限公司 管理后台”。
* 🔗 **页脚调整**：主页页脚删除联系电话和邮箱，并更新小红书、抖音跳转地址。
* **维护人**：Si_Nan

#### **2026-07-17 — 部署架构与文档规范化**
* 🚀 **部署架构解耦与优化**：
  * 对齐团队最新部署规划：前端准备托管至 **Cloudflare Pages**，后端 API 保持在 **阿里云 ECS** 上运行。
  * 将后端配置由传统的外部 YAML 加载，重构成更易管理、符合云原生安全的 **`.env` 环境变量文件**。微调 Systemd 服务通过 `EnvironmentFile` 指令自动读取环境配置。
* 💾 **自动化数据库备份与自愈**：
  * 编写了全链路自动调度脚本 `yashe_daily_scheduler.sh`。
  * 修复了 MySQL 8.0 普通用户缺乏全局 `PROCESS` 权限导致 `mysqldump` 备份表空间失败的报错（添加了 `--no-tablespaces` 参数）。
* 🛠️ **文档规范化重构**：
  * 建立了统一的 `DOC/` 归档文件夹，移除了根目录下临时散落的 Markdown 文件。
  * 重构了项目 [README.md](README.md) 主页，整合了团队的分支合并与 Commit 提交规范，并生成了全套文档的快捷跳转。
* 🐛 **流水线与仓库配置优化**：
  * 修正了 `.github/workflows/deploy.yml` 构建触发分支，由 `main` 更改为本仓库实际的默认主分支 `master`。
  * 在根目录 `.gitignore` 中追加了 `.worktrees/` 规则，防止开发中的本地 worktree 零散文件被误提交。
