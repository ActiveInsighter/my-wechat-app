# AnyWorkflow 微信小程序控制台

基于 **uni-app CLI + Vue 3 + TypeScript + Vite + Pinia + uni-ui** 的微信小程序，用于在手机上管理 AnyWorkflow 的云端任务队列。

## 当前功能

- 使用 PocketBase `aw_clients` 普通账户登录，不需要管理员密钥。
- 查看 `aw_dispatch_tasks` 云端任务列表和状态。
- 新建提示词 / 消息队列并保存为草稿。
- 将草稿发布为 `queued` 任务，触发现有 PocketBase Hook → n8n → 电脑端 AnyWorkflow 执行链路。
- 已发布任务正文只读，符合 AnyWorkflow 后端不可变约束。
- 对已完成 / 失败 / 取消任务复制并重新发布为新任务。
- 对活动任务请求暂停、继续、取消。
- 首页展示草稿、活动、失败任务计数和最近任务。
- GitHub Actions 自动执行类型检查、单元测试和微信小程序构建，并上传构建产物。

## 项目结构

```text
src/
├─ api/
│  ├─ dispatch.ts            # aw_dispatch_tasks REST API
│  ├─ pocketbase.ts          # PocketBase 请求与登录
│  └─ request.ts             # 其他通用 API 请求
├─ components/
│  └─ DispatchTaskCard.vue
├─ features/
│  └─ dispatch/
│     ├─ model.ts            # 纯业务规则，便于测试
│     └─ types.ts            # dispatch 契约类型
├─ pages/
│  ├─ index/                 # 移动控制台
│  ├─ explore/               # 任务队列
│  ├─ profile/               # 连接与设置
│  └─ task-editor/           # 提示词 / 队列编辑器
├─ stores/
│  ├─ dispatch.ts
│  └─ workflow.ts
└─ utils/
```

## 后端对应关系

小程序不会另建一套重复队列表，直接复用 AnyWorkflow 已有的：

```text
aw_clients
    ↓ auth / owner
aw_dispatch_tasks
    ↓ PocketBase hooks
aw_dispatch_events
    ↓ n8n scheduler
电脑端 AnyWorkflow worker
```

`aw_dispatch_tasks.queueText` 保存完整消息队列文本。发布任务时将状态设置为 `queued`，现有后端会创建初始 dispatch event 并唤醒调度流水线。

## 本地开发

建议使用 Node.js 20。

```bash
npm ci
cp .env.example .env
npm run dev:mp-weixin
```

`.env` 示例：

```dotenv
VITE_POCKETBASE_URL=https://pb.example.com
```

然后使用微信开发者工具导入：

```text
dist/dev/mp-weixin
```

并在 `src/manifest.json` 的 `mp-weixin.appid` 填入自己的微信小程序 AppID。

## 检查与构建

```bash
npm run type-check
npm run test:unit
npm run check
npm run build:mp-weixin
npm run ci:mp-weixin
```

Pull Request 和 `feat/**` / `fix/**` 分支会运行 `.github/workflows/ci.yml`：

1. `vue-tsc --noEmit`
2. `vitest run`
3. `uni build -p mp-weixin`
4. 上传 `dist/build/mp-weixin` artifact

## 安全说明

- 小程序登录使用 `aw_clients` 普通用户，不使用 PocketBase superuser token。
- 密码只用于登录请求，不写入 storage。
- 登录成功后会在小程序本机保存普通用户 auth token，以便后续同步任务。
- 正式上架前应在微信公众平台配置 PocketBase HTTPS 域名为合法 request 域名，并进一步接入微信身份登录。
