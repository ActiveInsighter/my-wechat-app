# 小程序工作台

基于 uni-app CLI、Vue 3、TypeScript、Vite、Pinia、uni-ui 和 Sass 的微信小程序起始项目。

## 开发

```bash
npm install
npm run dev:mp-weixin
```

然后使用微信开发者工具导入：

```text
dist/dev/mp-weixin
```

## 其他命令

```bash
npm run build:mp-weixin
npm run type-check
npm run test:unit
```

## 开始配置

1. 复制 `.env.example` 为 `.env`，填入后端 API 地址。
2. 在 `src/manifest.json` 的 `mp-weixin.appid` 填入你的小程序 AppID。
3. 根据业务需要扩展 `src/pages`、`src/api`、`src/stores` 和 `src/components`。

项目使用 uni-app 原生路由（`pages.json`）和 `uni.request`，没有引入 Vue Router、Axios 或仅支持浏览器 DOM 的组件库。
