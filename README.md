# 雅舍 Atelier des Miyabi

雅舍官网与会员/管理后台项目，包含：

- `api/` — Spring Boot 后端
- `view/` — React + TypeScript + Vite 前端
- `sql/` — 数据库初始化脚本

## 分支与合并流程

**禁止直接向主分支提交。** 每次改动须：

1. 从主分支检出新功能/修复分支并提交（Commits 仅落在该分支上）
2. 推送远程分支后申请合并（Pull Request / Merge Request）
3. 经审核通过后再合并进主分支

## Commit 规范

所有 Commits 均须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。格式示例：

```text
<type>: <简短描述>
```

部分 `type` 含义速览：

| type | 含义 |
|------|------|
| `build` | 影响构建系统或外部依赖项的更改（如：gulp、broccoli、npm） |
| `ci` | 对 CI 配置文件和脚本的更改（如 Dockerfile、ci.yml 等） |
| `chore` | 修改杂物，比如 `.gitignore` |
| `docs` | 仅更改文档 |
| `feat` | 新增功能 |
| `fix` | 缺陷修复 |
| `perf` | 性能优化的代码更改 |
| `refactor` | 既不修复错误也不添加功能的代码更改（功能不变但重构了某部分代码） |
| `style` | 不影响代码含义的更改（空格、格式、缺少分号等） |
| `test` | 添加缺失的测试或纠正现有的测试 |
| `revert` | 回退以前的 commit |

示例：

```text
feat: 增加管理员后台会员列表筛选
fix: 修复登录后 token 未写入 localStorage
docs: 补充部署与提交规范说明
chore: 更新 .gitignore 忽略 target 目录
```
