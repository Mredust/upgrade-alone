# Upgrade Alone · 个人管理

一个响应式个人数据记录应用，覆盖护肤、健身、饮食、身体四项数据。PC 与移动端共用同一份云端数据。

## 技术栈

- **框架**：Next.js 14（App Router）+ TypeScript
- **样式**：Tailwind CSS
- **状态**：Zustand（本地缓存）
- **云端**：Supabase PostgreSQL（单用户直连）

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 即可访问。

## 环境配置

在项目根目录创建 `.env.local`（已加入 `.gitignore`，不会被提交）：

```bash
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres
```

## 数据库初始化

后端直连 Supabase 云端数据库，包含 4 张表：`body_measures` / `diet_records` / `skin_records` / `training_records`。

首次启动时应用会自动建表（`create table if not exists`），也可以手动执行：

```bash
pnpm db:init
```

## 数据同步策略

- **云端为主**：所有增删改都会写入 Supabase，PC 与移动端共享同一份数据。
- **本地缓存**：Zustand 作为本地缓存即时渲染；启动时从云端拉取全量数据，写入失败会回退本地缓存并提示。
- **乐观更新**：本地状态先即时更新，云端同步失败时自动回滚。

## 常用脚本

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 生产构建
pnpm start    # 启动生产服务
pnpm lint     # 代码检查
pnpm db:init  # 初始化云端表结构（幂等）
```