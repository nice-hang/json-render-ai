# json-render-ai

一个基于 [json-render](https://github.com/vercel-labs/json-render) 和 WebMCP 构建的 Agent 原生低代码工作台。

本项目探索一种人与浏览器 Agent 共享的应用构建方式：人可以直接编辑可视化画布，Agent 则通过结构化 WebMCP 工具检查和修改同一份 json-render 规格。

## MVP

- 使用 json-render 渲染受约束的组件目录
- 将低代码编辑操作暴露为 WebMCP 工具
- 支持 Agent 检查、新增、更新、移动和删除组件
- 让人与 Agent 的修改实时同步到同一画布
- 校验每次结构化修改，并提供撤销历史
- 清晰展示人与 Agent 的操作日志

## 核心理念

```text
人工编辑 ─────┐
              ├─→ 工作台命令运行时 ─→ json-render 规格 ─→ 实时画布
WebMCP 工具 ──┘
```

WebMCP 工具的输入规格由 json-render 组件目录驱动，使 Agent 只能使用受支持的组件和经过校验的属性。

## 当前状态

Stage 4 已验证。当前仓库包含唯一 AppSpec Store、串行 Command Runtime、CRM/空白模板、真实 json-render 画布、Catalog 驱动属性编辑、显式删除确认、20 步撤销、50 条安全 human/agent 日志、最后有效状态恢复和确定性 Reset Demo；标准 `document.modelContext` 注册全部 8 个 Builder 工具，并已在真实 Chrome 的三个独立会话中连续跑通完整比赛闭环。Stage 5 正在准备干净 clone、README、许可证和比赛提交制品。

## 本地运行

要求：Node.js 22.12+、pnpm 11.20+。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://127.0.0.1:4173`。在组件树选择 `Text crm-intro`，修改 Content 并保存；再通过属性面板的 Quick add 新增 Metric。两类人工操作都经过 Command Runtime，并同步更新组件树、真实 json-render 画布和活动日志。

## 验证

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

真实 WebMCP lane 需要本机安装 Google Chrome 152+，并由测试进程通过官方实验开关启动独立浏览器会话：

```bash
pnpm test:webmcp:real
```

普通 `test:e2e` 中的 WebMCP 测试只验证 adapter 契约并显式注入测试表面；它不作为真实协议证据。`test:webmcp:real` 不注入 shim，直接通过 Chrome 原生 `document.modelContext.getTools()` 和 `executeTool()` 发现并调用工具。

## 项目流程

项目采用带阶段门和验证证据的分阶段交付流程。文档地图和阶段规则见 [`docs/README.md`](docs/README.md)。

三分钟 CRM 演示的固定步骤和精确工具输入见 [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)。

## 开源协议

首次发布前将补充开源协议。
