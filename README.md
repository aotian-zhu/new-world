# 新世界庄园

《破笼之宴》互动纪念站。项目基于 `Vite + React + TypeScript` 构建，包含首页叙事、互动地图、记忆展区、小游戏与玩家留言内容。

## 本地开发

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
```

构建产物会输出到 `dist` 目录。

## 环境变量

复制 `.env.example` 为 `.env`，并填写你自己的 Supabase 配置：

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 部署建议

- 推荐部署平台：`Vercel`
- 项目已包含 `vercel.json`，用于处理 `React Router` 的前端路由回退
- 部署时请在平台后台配置同名环境变量
- 正式公开前，请确认 Supabase 已开启 `RLS`，并为 `memories`、`comments`、`memory_likes` 配好访问策略

## 发布流程

1. 将项目推送到 GitHub 仓库
2. 在 Vercel 导入该仓库
3. 配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`
4. 完成首次部署并检查 `/` 与 `/memories`
5. 绑定自定义域名并等待 HTTPS 生效
