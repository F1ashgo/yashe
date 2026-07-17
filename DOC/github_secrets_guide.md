# GitHub Actions 阿里云服务器自动化部署密钥 (Secrets) 配置指南

在您配置的自动化部署中，`.github/workflows/deploy.yml` 需要连接阿里云服务器。部署必须使用独立的非 root 账号和专用密钥，密钥材料只能保存在服务器及 GitHub Secrets 中。

以下是完整的配置与使用步骤：

---

## 🔑 第一步：在阿里云服务器上挂载“公钥”锁头
先生成一把新的机器专用密钥，再将公钥写入服务器授权列表：

1. 在受信任的本地终端生成密钥：
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-yashe"
   ```
2. 将生成的公钥 `<DEPLOY_PUBLIC_KEY>` 添加到专用部署账号：
   ```bash
   nano ~/.ssh/authorized_keys
   ```
3. 在文件末尾另起一行粘贴公钥，不要把私钥复制到服务器或仓库。
4. 按 `Ctrl + O` 保存，回车确认，按 `Ctrl + X` 退出。

---

## 🛠️ 第二步：在 GitHub 仓库中配置 4 个秘密变量 (Secrets)
1. 登录您的 GitHub 仓库主页。
2. 点击上方的 **Settings** 选项卡 -> 左侧菜单栏选择 **Secrets and variables** -> 点击 **Actions**。
3. 点击右上角的 **New repository secret**，依次添加以下 4 个密钥对：

### 1. `SERVER_IP` (服务器公网 IP)
* **Name** 填写：`SERVER_IP`
* **Value** 填写：`<SERVER_IP>`
* 保存。

### 2. `SERVER_USER` (SSH 登录账号)
* **Name** 填写：`SERVER_USER`
* **Value** 填写：`<NON_ROOT_DEPLOY_USER>`
* 保存。

### 3. `SERVER_PORT` (SSH 登录端口)
* **Name** 填写：`SERVER_PORT`
* **Value** 填写：`22`
* 保存。

### 4. `SERVER_KEY` (流水线专属私钥) —— ⚠️ 重点步骤
* **Name** 填写：`SERVER_KEY`
* **Value**：从本地私钥文件直接粘贴到 GitHub Secret，仓库文档中仅记录 `<PASTE_INTO_GITHUB_SECRET_ONLY>`。
* 保存。

> [!CAUTION]
> 如果旧部署密钥曾进入 Git，请立即从服务器 `authorized_keys` 撤销对应公钥，并重新创建 `SERVER_KEY` Secret。

### 前端构建变量

在同一页面的 **Variables** 区域新增仓库变量 `TURNSTILE_SITE_KEY`，填写 Cloudflare Turnstile
组件的公开 Site Key。它会在构建时写入前端；Turnstile Secret Key 不得放在这里，必须仅以
`YASHE_TURNSTILE_SECRET_KEY` 保存于后端服务器的服务环境中。

---

## 🚀 第三步：如何测试并查看自动化部署

1. **推送代码**：
   在您本地的开发终端中，运行 Git 提交命令并推送：
   ```bash
   git add .
   git commit -m "chore: configure github actions deploy keys"
   git push origin <feature-branch>
   ```
2. **监控构建与发布**：
   * 打开 GitHub 项目页面，点击顶部的 **Actions**。
   * 点击正在运行的 `Build and Deploy to Alibaba Cloud` 任务。
   * 您可以实时查看编译打包与发布全过程。绿灯全亮即代表您的最新代码已成功更新部署至阿里云服务器！
