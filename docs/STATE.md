# 项目状态

本文档记录当前已验证的状态快照。保持简短；历史细节应进入 Git 历史、计划、决策或验证证据。

## 当前快照

- 更新时间：2026-09-03
- 项目：`json-render-ai`
- 方向：基于 json-render 的低代码工作台，通过 WebMCP 暴露自身编辑能力
- 活跃阶段：Stage 5 — 比赛交付
- 阶段状态：`in_progress`
- 最近已验证里程碑：真实 Codex Agent 已在本地应用发现全部 8 个 WebMCP 工具，并完成读取、新增、校验拒绝、更新、移动、删除预览/拒绝/确认、Undo、刷新恢复和可见 Agent Activity 验证

## 已确认决策

- 比赛 MVP 优先实现低代码工作台自身的 WebMCP 能力。
- MVP 不要求生成出来的应用继续暴露 WebMCP 工具。
- 人工编辑和 Agent 编辑最终应操作同一份应用规格和运行时。
- 比赛 wow moment 是 Agent 通过 WebMCP 修改画布、人工即时看到变化并可审计和撤销。
- MVP 使用固定 8 组件 Catalog 和 8 个 Builder WebMCP 工具，不做自由拖拽与后端平台。
- 用户已确认 MVP 范围、AC-01～AC-18 和 Stage 0～5 边界。
- AppSpec 保持 `rootId` + `nodes` 公共契约，仅由单一 adapter 转为 json-render `root` + `elements`。
- 固定 `@json-render/core`/`react` 0.20.0；WebMCP 使用标准 `document.modelContext` 和 AbortSignal 注销。
- Store 快照冻结且仅由串行 Command Runtime 提交；CRM/空白模板有效，CRM 覆盖全部 8 种组件。
- 8 个 Builder 工具均通过标准 `document.modelContext` 注册；真实 Chrome 已完成读、新增、更新、移动、删除确认和撤销。
- 真实 Codex desktop Agent 已通过内置浏览器原生 `webmcp` capability 操作本地生产预览；未使用测试 shim、DOM 注入或直接 JavaScript 调用，证据见 `docs/evidence/2026-09-03-codex-agent-webmcp-verification.md`。
- Undo 历史固定为 20 个已提交前态，Activity 固定为 50 条脱敏截断摘要；二者不跨刷新，最后有效 AppSpec 跨刷新恢复。
- Reset Demo 在同一 Runtime 内恢复 15 节点 CRM 并清空会话状态；最终三次原生 Chrome 彩排分别为 622ms、533ms、556ms。
- 公共 `main` 候选已通过干净 clone 复现：全流程 24 秒，dev server 74ms 就绪；最终 AC 矩阵当前严格为 15/18 passed。
- 生产验证入口已准备：`PRODUCTION_URL=<https-url> pnpm test:e2e:production` 会直接对公网来源运行三次原生 WebMCP 完整闭环，不启动本地替代服务；英文逐字旁白已定时到 2 分 20 秒。
- 用户将当前交付边界明确为本地私有产物；可复现构建器会生成生产包、源码快照、三张截图、提交材料、逐文件校验和及 1280×720 带旁白 MP4，并且不执行任何公开写入。

## 待确认决策

- 生产托管平台和真实比赛提交环境；推荐选择可提供固定 HTTPS 的静态托管。
- 参赛主体的年龄、合资格居住地/组织注册地、利益冲突/支持声明、代表权限、Devpost 注册和规则同意。
- 对外部署、公开视频和比赛提交尚未授权；仅准备制品。

## 阻塞项

- 当前没有实现阻塞或本地交付阻塞；本地 MVP 交付包已生成并通过解压、启动、校验和及音视频流复验。
- 用户当前选择不执行比赛上传。AC-16 因无公网部署保持未通过；AC-17 仅缺经验证部署地址；AC-18 缺生产 URL、公开配音视频、参赛资格/注册确认和最终人工确认。

## 下一步

向用户交付本地 ZIP、SHA-256 和 MP4。只有用户以后恢复比赛发布范围时，才取得参赛资格、部署、公开视频和最终提交授权并继续关闭 AC-16～AC-18。
