# lobster-roast 部署指南（Vercel + Supabase）

## 一、Supabase 网络设置检查（解决连接失败）

Vercel 连接 Supabase 失败时，**首先检查网络限制**：

### 1. 打开 Network Restrictions

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 左侧菜单 **Project Settings** → **Database**
4. 滚动到底部找到 **Network Restrictions**

> 若看不到此选项，需在 **Infrastructure Settings** 中升级 Postgres 版本。

### 2. 允许外部访问

**情况 A：从未配置过限制**

- 默认允许所有 IP，通常无需改动
- 若连接仍失败，检查下方「连接字符串」和「连接池」配置

**情况 B：已启用 IP 限制**

Vercel 使用动态 IP，需放行全部来源：

1. 在 Network Restrictions 中点击 **Edit**
2. 添加：
   - IPv4: `0.0.0.0/0`
   - IPv6: `::/0`
3. 保存

**使用 CLI 放行所有 IP：**

```bash
supabase network-restrictions --project-ref <你的PROJECT_REF> update \
  --db-allow-cidr 0.0.0.0/0 --db-allow-cidr ::/0 --experimental
```

### 3. 连接字符串格式（必读）

| 用途 | 端口 | 格式 | 说明 |
|------|------|------|------|
| **运行时（DATABASE_URL）** | 6543 | Transaction 连接池 | 适合 Vercel serverless |
| **迁移（DIRECT_DATABASE_URL）** | 5432 | 直连 | 用于 `prisma migrate deploy` |

在 Supabase 控制台：**Project Settings** → **Database** → **Connection string** 可切换：

- **Transaction mode**（端口 6543）→ 填入 `DATABASE_URL`
- **Direct connection**（端口 5432）→ 填入 `DIRECT_DATABASE_URL`

### 4. IPv4 / IPv6 说明

- 直连（5432）默认仅支持 IPv6，部分环境可能连不上
- 使用 **pooler 连接池**（Transaction/Session 模式）可同时支持 IPv4 和 IPv6，建议优先使用

---

## 二、Vercel 环境变量配置

在 Vercel 项目 **Settings** → **Environment Variables** 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | Transaction 连接池 URL（端口 6543） | Production, Preview |
| `DIRECT_DATABASE_URL` | 直连 URL（端口 5432） | Production, Preview |
| `SECOND_ME_CLIENT_ID` | 你的 Client ID | Production |
| `SECOND_ME_CLIENT_SECRET` | 你的 Client Secret | Production |
| `SECOND_ME_REDIRECT_URI` | `https://你的项目.vercel.app/api/auth/callback` | Production |
| `MINIMAX_API_KEY` | 你的 MiniMax API Key | Production |

---

## 三、部署流程

1. 在 Supabase 创建项目并完成网络设置
2. 在 Vercel 导入 GitHub 仓库
3. 配置上述环境变量
4. 部署（构建时会自动执行 `prisma migrate deploy`）

---

## 四、常见错误排查

### Connection refused / 连接超时

- 检查 Network Restrictions 是否放行 `0.0.0.0/0` 和 `::/0`
- 确认使用的是 pooler URL（端口 6543），而非直连（5432）
- 验证密码和项目引用是否正确

### prepared statement does not exist

- 确保 `DATABASE_URL` 带 `?pgbouncer=true`（代码中已自动添加）
- 或使用 Session 模式连接池（端口 5432，pooler 服务器）而非 Transaction 模式

### prisma migrate deploy 失败

- 使用 `DIRECT_DATABASE_URL`（直连，端口 5432）执行迁移
- 不要在迁移时使用连接池 URL

### 本地开发

本地需使用 PostgreSQL。可选方式：

- 使用 Supabase 项目的连接字符串
- 本地运行 `supabase start` 或 Docker Postgres

设置 `.env.local`：

```
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
```
