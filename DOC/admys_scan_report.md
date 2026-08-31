# admys.cn 深度安全扫描报告

**扫描时间**：2026-07-17 15:57 ~ 16:10 CST  
**扫描方式**：Tor obfs4 网桥 → proxychains → 匿名出口节点  
**扫描深度**：JS 逆向 | API 枚举 | 子域名爆破 | 目录爆破 | JWT 攻击 | 权限提升测试

---

## 一、资产清单

| 资产 | 值 |
|------|-----|
| 主站 | `https://admys.cn` |
| API | `https://api.admys.cn/api` |
| 网站名称 | Atelier des Miyabi 雅舍 — 室内设计公司 |
| CDN/WAF | Cloudflare（AMS/FRA 节点） |
| DNS 托管 | kristin.ns.cloudflare.com / rayden.ns.cloudflare.com |
| Cloudflare IP | `104.21.0.214` / `172.67.128.78` |
| 开放端口 | 80, 443, 8080, 8443（均为 Cloudflare 边缘节点） |
| 子域名 | 仅 `www`、`api` |
| 邮件服务 | 无 MX 记录 |
| 公司实体 | Chun King Limited（香港） |
| 物理地址 | 广州市南沙区凯翔路1号1702 |
| 工作时间 | 周一至周五 9:00 - 18:00 / 周六 10:00 - 16:00（预约制） |

---

## 二、技术栈指纹

```
前端框架:   React 18 + Vite 构建（JS bundle 262KB / CSS bundle 91KB）
CDN/WAF:    Cloudflare（ECH 加密 + HTTP/3 支持）
后端框架:   Spring Boot（推测，基于安全头特征）
API 风格:   RESTful JSON，统一响应 {code, message, data}
认证机制:   JWT HS256（access_token / admin_token，对称签名）
TLS:        TLS 1.3 + X25519MLKEM768
HTTP:       HTTP/2 + HTTP/3 (alt-svc: h3)
```

### 响应头特征

```
server: cloudflare
x-content-type-options: nosniff
x-xss-protection: 0
x-frame-options: DENY
cache-control: no-cache, no-store, max-age=0, must-revalidate
access-control-allow-origin: https://admys.cn
access-control-allow-credentials: true
```

---

## 三、前端路由发现

### 公开页面

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/about` | 关于雅舍 |
| `/services` | 服务范畴 |
| `/projects` | 精选作品 |
| `/member` | 会员中心 |
| `/contact` | 联络我们 |

### 管理后台

| 路由 | 访问 | 说明 |
|------|------|------|
| `/admin/login` | ✅ 公开 | 管理员登录页 |
| `/admin/dashboard` | 🔒 需认证 | 管理仪表盘（admin_token） |

---

## 四、API 架构完整枚举

**Base URL**: `https://api.admys.cn/api`  
（开发环境: `http://localhost:8080/api`）

### 4.1 无需认证的端点

| 端点 | 方法 | HTTP 状态 | 风险 |
|------|------|-----------|------|
| `/notifications/latest` | GET | **200 OK** | 🟠 信息泄露 |
| `/contact/send` | POST | **200 OK** | 🟠 可滥用 |
| `/auth/register` | POST | **200 OK** | 🟠 无验证码 |
| `/auth/login` | POST | 403（Cloudflare WAF） | 🟡 弱口令风险 |

### 4.2 需要认证的端点（member）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/me` | GET | 获取当前用户信息 |
| `/reviews/my` | GET | 我的评价列表 |
| `/reviews` | POST | 提交评价 |

### 4.3 需要认证的端点（admin only）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/admin/stats` | GET | 统计数据（total, today） |
| `/admin/members` | GET | 会员列表（分页+搜索） |
| `/admin/notifications` | GET | 通知列表 |
| `/admin/notifications` | POST | 发布通知（title, content, type） |
| `/admin/notifications/{id}/status` | PATCH | 切换通知状态 |
| `/admin/notifications/{id}` | DELETE | 删除通知 |

### 4.4 认证机制

```
注册:  POST /auth/register  {name, email, password, phone}
         → {code:200, data:{token:"<JWT>"}}

登录:  POST /auth/login      {username, password}
         → {code:200, data:{token:"<JWT>"}}

请求:  Authorization: Bearer <JWT>

JWT Payload:
  {
    "sub": "user@email.com",
    "userId": <id>,
    "role": "member|admin",
    "iat": <timestamp>,
    "exp": <timestamp + 7天>
  }
```

---

## 五、项目图片路径

```
/雅舍室内设计.png
/幼儿园/课室正面.jpeg
/幼儿园/课室侧面.jpeg
/幼儿园/书柜.jpeg
/幼儿园/閱讀室.jpeg
/中药铺/中藥鋪1.jpeg
/中药铺/中藥鋪2.jpeg
/中药铺/中药铺3.jpeg
/中药铺/中药铺4.jpeg
/classroom/課室.jpeg
/classroom/課室1.jpeg
/classroom/課室2.jpeg
/house/家裝.png
/house/家裝2.jpeg
/lab/實驗室.jpeg
/lab/實驗室2.jpeg
/office/辦公室.jpeg
/office/辦公室2.jpeg
/office/辦公室3.jpeg
/lunbotu/课室侧面.jpeg
/lunbotu/閱讀室-帶白板.jpeg
```

---

## 🔴 六、安全发现

### 6.1 未授权信息泄露 — `/api/notifications/latest`

**严重程度**：🟠 中危

```
GET /api/notifications/latest → 200 OK
```

无需任何认证即可获取全部通知数据，包含：

| 字段 | 示例 |
|------|------|
| `id` | 7 |
| `title` | "测试" |
| `content` | "测试1" |
| `type` | "公告" |
| `status` | 1 |
| `createdAt` | "2026-07-17T12:33:50" |
| `updatedAt` | "2026-07-17T12:33:50" |

**泄露内容**：内部测试数据、运营通知、发布时间戳，可被用于了解系统活跃度和内部运营节奏。

**修复建议**：添加认证中间件，或仅返回 `type=公告, status=1` 的公开通知并脱敏处理。

---

### 6.2 公开注册无保护 — `/api/auth/register`

**严重程度**：🟠 中危

```
POST /api/auth/register → 200 OK + JWT Token
```

- ❌ 无验证码保护
- ❌ 无邮箱验证
- ❌ 无速率限制
- ❌ 注册即获合法 JWT（member 角色）

**成功注册响应**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "<REDACTED_MEMBER_JWT>"
  }
}
```

**潜在威胁**：可被脚本批量注册虚假账号，获取大量合法 JWT 用于后续攻击。

**修复建议**：
- 添加图形验证码（captcha）
- 添加邮箱验证流程
- IP 级别速率限制（如每分钟 3 次）
- 考虑手机短信验证

---

### 6.3 未授权表单提交 — `/api/contact/send`

**严重程度**：🟠 中危

```
POST /api/contact/send → 200 OK
{"code":200,"message":"感谢您的留言，我们将在24小时内与您联系！","data":{}}
```

- 无需认证
- 无 CSRF Token
- 无频率限制
- 任意数据可提交

**测试请求**：
```json
{"name":"test","email":"test@test.com","phone":"13800000000","message":"test"}
```
→ 返回成功，且每次提交都生成新的成功响应。

**修复建议**：添加 CSRF Token、请求频率限制、内容过滤。

---

### 6.4 JWT 安全分析

**严重程度**：🟡 低危

| 测试项 | 结果 |
|--------|------|
| 签名算法 | HS256（对称加密） |
| none 算法攻击 | ✅ 被正确阻止（403） |
| 空签名绕过 | ✅ 被正确阻止（403） |
| Token 有效期 | ~7 天（较长） |
| 权限隔离 | ✅ member 无法访问 admin 端点 |
| 密钥泄露 | ⚠️ 对称密钥，泄露即全局风险 |

**修复建议**：
- 迁移至 RS256（非对称）签名
- 缩短 access_token 有效期至 1-2 小时
- 实现 refresh_token 机制

---

### 6.5 JS Bundle 信息暴露

**严重程度**：🟡 低危

前端 JS bundle（262KB）中包含了完整的：
- API 端点清单
- 认证逻辑（localStorage token 存取）
- 管理后台功能逻辑
- 全部页面文本内容

攻击者可一次性获取所有 API 结构，无需通过传统枚举手段。

**修复建议**：使用 code splitting 将管理后台路由及其 API 调用分离到独立 chunk，仅管理员登录后按需加载。

---

### 6.6 技术栈指纹暴露

**严重程度**：🟡 信息

- `server: cloudflare` → 确认 CDN 提供商
- `x-xss-protection: 0`、`x-frame-options: DENY` → Spring Security 特征
- favicon hash: `88be931fa4ba42052e141590f1752f684dfcb8a4696f66448f6b309a795760d6`

---

## ✅ 七、已通过的安全测试

| 测试项 | 方法 | 结果 |
|--------|------|------|
| JWT none 算法攻击 | `alg:"none"` | ❌ 403 被阻止 |
| JWT 空签名绕过 | 签名部分为空 | ❌ 403 被阻止 |
| member → admin 提权 | member token 访问 `/admin/*` | ❌ 403 "无权限" |
| IDOR 越权 | 修改 userId 访问他人资源 | ❌ 返回空/404 |
| SQL 注入（基础） | 单引号注入测试 | ❌ 无错误回显 |
| 路径遍历 | `../` 测试 | ❌ 403 |
| Cloudflare 直连 | 直接 IP + Host 头 | ❌ Error 1003 |
| 源站 IP 泄露 | DNS MX/SPF/TXT/NS 记录 | ❌ 无泄露 |
| 子域名爆破 | 300+ 字典 | ❌ 仅 api/www |
| 目录爆破 | 200+ 路径 | ❌ SPA 统一路由 |
| Spring Actuator | `/actuator/*` | ❌ SPA 路由覆盖 |

---

## 📊 八、综合评估

| 类别 | 评分 | 说明 |
|------|------|------|
| CDN/WAF 防护 | 🟢 强 | Cloudflare 全站代理，直连阻止 |
| 源站隐藏 | 🟢 强 | 无 DNS/证书/邮件侧泄露 |
| 认证机制 | 🟡 中 | JWT 正常，但注册无保护 |
| 授权控制 | 🟢 强 | member/admin 权限隔离正确 |
| API 暴露面 | 🟠 中 | 3 个未授权端点 |
| 信息泄露 | 🟡 中 | JS 源码 + 通知 API 泄露 |
| 输入验证 | 🟢 强 | 基础防护到位 |
| 传输安全 | 🟢 强 | TLS 1.3 + ECH |

### 风险总结

**确认问题**：3 个中危（未授权 API），2 个低危（JWT/信息泄露）

**攻击面**：Cloudflare 有效隐藏了源站，直接攻击后端困难。主要攻击面在于公开 API 端点和前端信息泄露。

---

## 💡 九、修复优先级建议

| 优先级 | 问题 | 建议 |
|--------|------|------|
| 🔴 P0 | 无 | — |
| 🟠 P1 | `/auth/register` 无保护 | 添加验证码 + 邮箱验证 + 速率限制 |
| 🟠 P1 | `/contact/send` 无保护 | 添加 CSRF Token + 频率限制 |
| 🟡 P2 | `/notifications/latest` 泄露 | 添加认证或返回脱敏数据 |
| 🟡 P2 | JWT HS256 对称签名 | 迁移至 RS256 |
| 🟡 P2 | JS Bundle 暴露 API 结构 | Code splitting 分离管理后台 |
| 🔵 P3 | 技术栈指纹 | `server` 头混淆 / 自定义错误页 |

---

*报告生成时间: 2026-07-17 16:10 CST*  
*扫描工具: nmap / proxychains / curl / 手工 JS 逆向*
