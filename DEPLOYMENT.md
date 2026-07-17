# 雅舍网站上线准备清单

## 1. 前端 Cloudflare Pages

- 构建目录：`view`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：

```env
VITE_API_BASE_URL=https://api.admys.cn/api
```

`view/public/_redirects` 已配置 SPA 路由回退，刷新 `/about`、`/member`、`/admin/login` 不会 404。

## 2. 后端服务器建议

推荐初期使用一台云服务器同时放 Spring Boot 和 MySQL：

- Ubuntu 22.04 / 24.04 LTS
- 2 核 CPU
- 4GB RAM
- 50GB+ SSD
- 只开放 80 / 443 / 受限 22
- 不开放 3306 到公网
- Spring Boot 监听 `127.0.0.1:8080`
- Nginx 反代 `https://api.your-domain.cn` 到 `127.0.0.1:8080`

## 3. 后端环境变量

参考 `api/.env.example`：

```env
SERVER_PORT=8080
SERVER_ADDRESS=127.0.0.1
DB_URL=jdbc:mysql://127.0.0.1:3306/yashe_db?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
DB_USERNAME=yashe_app
DB_PASSWORD=replace-with-strong-password
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRATION=604800000
CORS_ALLOWED_ORIGINS=https://www.admys.cn,https://admys.cn,https://yashe.pages.dev
```

生产环境必须替换：

- 数据库密码
- JWT_SECRET
- CORS_ALLOWED_ORIGINS
- API 域名

## 4. MySQL 初始化

服务器创建数据库后执行：

```bash
mysql -u root -p < sql/init.sql
```

建议单独创建应用用户，不使用 root 连接后端：

```sql
CREATE USER 'yashe_app'@'127.0.0.1' IDENTIFIED BY '强密码';
GRANT SELECT, INSERT, UPDATE, DELETE ON yashe_db.* TO 'yashe_app'@'127.0.0.1';
FLUSH PRIVILEGES;
```

## 5. Nginx 反代示例

```nginx
server {
    listen 80;
    server_name api.your-domain.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.cn;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.cn/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. 上线前必须确认

- 前端环境变量 `VITE_API_BASE_URL` 已指向正式 API
- 后端 `CORS_ALLOWED_ORIGINS` 已设置为正式前端域名
- MySQL 3306 未暴露公网
- `JWT_SECRET` 已更换为生产随机密钥
- 管理员账号密码已更换
- Cloudflare SSL 模式使用 Full strict
- API 域名证书有效

## 7. 本地验证命令

```bash
cd view
npm run build
```

```bash
cd api
mvn -DskipTests "-Dmaven.compiler.useIncrementalCompilation=false" compile
```
