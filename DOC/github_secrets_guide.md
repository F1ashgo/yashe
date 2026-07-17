# GitHub Actions 阿里云服务器自动化部署密钥 (Secrets) 配置指南

在您配置的自动化部署中，`.github/workflows/deploy.yml` 需要连接并操控您的阿里云服务器。为了**绝对保障您服务器的安全**，且保证部署流程不与任何开发人员的“个人私钥”绑定，我们为您生成并配置了一把 **“机器专用部署密钥 (Deploy Key)”**。

以下是完整的配置与使用步骤：

---

## 🔑 第一步：在阿里云服务器上挂载“公钥”锁头
您需要将以下这行专用公钥，写入您服务器的授权列表中，允许 GitHub 虚拟机连接：

1. 复制下方这行完整的公钥内容：
   ```text
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH2a6s1aPGasfXvJVbq0G7MQnw18TmGAxYGoe9kyTdPU github-actions
   ```
2. 登录您的阿里云服务器终端，打开授权文件：
   ```bash
   nano ~/.ssh/authorized_keys
   ```
3. 在文件末尾，**另起一行**，粘贴刚刚复制的公钥内容。
4. 按 `Ctrl + O` 保存，回车确认，按 `Ctrl + X` 退出。

---

## 🛠️ 第二步：在 GitHub 仓库中配置 4 个秘密变量 (Secrets)
1. 登录您的 GitHub 仓库主页。
2. 点击上方的 **Settings** 选项卡 -> 左侧菜单栏选择 **Secrets and variables** -> 点击 **Actions**。
3. 点击右上角的 **New repository secret**，依次添加以下 4 个密钥对：

### 1. `SERVER_IP` (服务器公网 IP)
* **Name** 填写：`SERVER_IP`
* **Value** 填写：`8.163.51.48`
* 保存。

### 2. `SERVER_USER` (SSH 登录账号)
* **Name** 填写：`SERVER_USER`
* **Value** 填写：`root`
* 保存。

### 3. `SERVER_PORT` (SSH 登录端口)
* **Name** 填写：`SERVER_PORT`
* **Value** 填写：`22`
* 保存。

### 4. `SERVER_KEY` (流水线专属私钥) —— ⚠️ 重点步骤
* **Name** 填写：`SERVER_KEY`
* **Value** 请**完整复制并粘贴**以下虚线框内的全部私钥内容（必须包含最开头和最末尾的 `-----BEGIN...` 和 `-----END...` 标识）：
  ```text
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
  QyNTUxOQAAACB9murNWjxmrH17yVW6tBuzEJ8NfE5hgMWBqHvZMk3T1AAAAJh+TVkNfk1Z
  DQAAAAtzc2gtZWQyNTUxOQAAACB9murNWjxmrH17yVW6tBuzEJ8NfE5hgMWBqHvZMk3T1A
  AAAECzd0UI7ZUCodyBiqU/xi+ISnTmOTSL8yNOPiGaJGA7W32a6s1aPGasfXvJVbq0G7MQ
  nw18TmGAxYGoe9kyTdPUAAAADmdpdGh1Yi1hY3Rpb25zAQIDBAUGBw==
  -----END OPENSSH PRIVATE KEY-----
  ```
* 保存。

---

## 🚀 第三步：如何测试并查看自动化部署

1. **推送代码**：
   在您本地的开发终端中，运行 Git 提交命令并推送：
   ```bash
   git add .
   git commit -m "chore: configure github actions deploy keys"
   git push origin main
   ```
2. **监控构建与发布**：
   * 打开 GitHub 项目页面，点击顶部的 **Actions**。
   * 点击正在运行的 `Build and Deploy to Alibaba Cloud` 任务。
   * 您可以实时查看编译打包与发布全过程。绿灯全亮即代表您的最新代码已成功更新部署至阿里云服务器！
