# WebMCP Builder MVP 规格

- 状态：`confirmed`
- 日期：2026-09-02
- 目标比赛：WebMCP Challenge
- 权威范围：本文档定义比赛 MVP 的产品行为、技术边界和验收标准。

## 1. 产品命题

`json-render-ai` 是一个 Agent 原生的轻量低代码工作台。人通过组件树和属性面板编辑页面，浏览器 Agent 通过 WebMCP 工具读取和修改同一份受约束的 AppSpec；所有修改都经过同一命令运行时、即时反映到 json-render 画布，并且可观察、可校验、可撤销。

一句话介绍：

> Build a UI with your agent: human edits and WebMCP tool calls share one validated json-render spec, one live canvas, and one undoable history.

## 2. 目标用户与问题

目标用户是希望用浏览器 Agent 快速搭建内部工具原型的开发者或技术型创作者。

现有 AI 页面生成通常把 Agent 限制在聊天框或一次性代码生成中，后续修改粒度大、状态不透明、失败难恢复。本 MVP 要证明：网站可以主动向 Agent 暴露受 Schema 约束的编辑能力，同时保留人的直接控制权。

## 3. 比赛演示主路径

1. 打开工作台，载入一个可直接演示的 CRM 看板模板。
2. 人在组件树选择一个组件，并在属性面板修改标题；画布即时更新。
3. 浏览器 Agent 发现工作台注册的 WebMCP 工具，先调用只读工具理解当前 AppSpec。
4. Agent 新增一个统计卡片、更新属性并移动其位置；画布每次都即时更新。
5. 操作日志明确显示来源、工具、参数摘要、结果和时间。
6. Agent 发起删除操作，产品要求用户确认；拒绝时规格不变，确认后才执行。
7. 用户点击撤销，最后一次已提交修改被完整恢复。
8. 刷新页面后，最近保存的有效 AppSpec 仍能恢复并继续编辑。

演示的唯一 wow moment 是：**Agent 不操作像素或 DOM，而是调用页面公开的结构化工具修改与人共享的应用规格；整个过程立即可见、受约束且可撤销。**

## 4. MVP 范围

### 4.1 必须交付

- 单页面工作台：组件树、实时画布、属性面板、操作日志。
- 一个受约束的组件目录，固定支持 8 种组件：`Page`、`Stack`、`Card`、`Text`、`Metric`、`Button`、`Input`、`Select`。
- 一份版本化 AppSpec，至少包含根节点、组件 ID、类型、属性和子节点关系。
- 一个统一命令运行时，支持检查、新增、更新、移动、删除、校验和撤销。
- 人工操作与 WebMCP 工具调用必须复用同一命令运行时。
- WebMCP 工具：`describe_app`、`list_components`、`add_component`、`update_component`、`move_component`、`remove_component`、`validate_app`、`undo_last_change`。
- 每次写操作都进行输入 Schema 校验、目录约束校验和结构不变量校验。
- 删除操作必须先经过明确确认；无确认时不能修改状态。
- 本地持久化、损坏数据回退、可见错误状态和最多 50 条操作历史。
- 一个预置 CRM 演示模板，以及空白模板恢复入口。
- 可公开访问的生产部署、英文 README、演示视频和提交素材。

### 4.2 明确不做

- Prompt 直接生成完整 AppSpec；本次重点是 WebMCP 编辑闭环。
- 让生成出来的应用继续注册业务 WebMCP 工具。
- 自由拖拽、缩放、像素级布局和响应式设计器。
- 数据库、认证、多用户协作、发布平台和权限系统。
- 自定义 JavaScript、插件市场、代码导出和外部数据源。
- 通用 CRUD 应用运行时；CRM 只是演示模板，不是完整 CRM 产品。

只有 Stage 5 全部通过且仍有时间时，才允许重新评估延后项。

## 5. 架构边界

### 5.1 状态与数据流

```text
Human editor ─────┐
                  ├─> Command Runtime ─> Validation ─> AppSpec Store ─> json-render Canvas
WebMCP adapter ───┘          │                    │
                             └─> Activity Log     └─> Undo Snapshot / Persistence
```

- `AppSpec Store` 是编辑状态唯一所有者。
- `Command Runtime` 是所有写入的唯一入口；UI 和 WebMCP 适配器禁止直接改 Store。
- `Catalog` 同时约束渲染、属性编辑器、命令参数和 WebMCP 工具输入。
- `WebMCP adapter` 只负责注册/注销工具及协议适配，不包含业务变更逻辑。
- 持久化只保存最近的有效 AppSpec；无效输入不能覆盖有效快照。

### 5.2 建议技术栈

- React + TypeScript + Vite，优先静态部署和快速浏览器验证。
- json-render 作为受约束 UI 渲染层。
- Zod 或等价 Schema 库作为 AppSpec 与命令输入的运行时校验层。
- Vitest + Testing Library 负责单元和组件集成测试。
- Playwright 负责主流程、确认、撤销、刷新恢复和 WebMCP 接口浏览器验证。

若 json-render 或 WebMCP 的实际 API 与假设不符，Stage 0 必须先用隔离 spike 固化适配层，不能把不确定性泄漏到功能代码。

## 6. 公开契约

### 6.1 AppSpec 最小形态

```ts
type AppSpec = {
  version: 1
  rootId: string
  nodes: Record<
    string,
    {
      id: string
      type:
        | 'Page'
        | 'Stack'
        | 'Card'
        | 'Text'
        | 'Metric'
        | 'Button'
        | 'Input'
        | 'Select'
      props: Record<string, unknown>
      children?: string[]
    }
  >
}
```

不变量：

- `rootId` 必须存在且类型为 `Page`。
- 所有 ID 全局唯一，所有 child 引用必须存在。
- 除根节点外，每个节点恰好有一个父节点。
- 结构无环、无孤儿节点。
- 组件属性必须通过对应 Catalog Schema。
- 删除父节点时必须明确采用递归删除，且在执行前确认影响节点数。

### 6.2 命令结果

每个命令返回同一结构：

```ts
type CommandResult = {
  success: boolean
  commandId: string
  changedNodeIds: string[]
  message: string
  requiresConfirmation?: boolean
  undoAvailable: boolean
  errors?: Array<{ path: string; code: string; message: string }>
}
```

失败命令不得产生部分写入，也不得进入撤销栈。

## 7. 严格验收标准

以下标准均为最终 MVP 必须满足；`部分通过` 不视为通过。

### 产品闭环

- **AC-01 可运行：** 从干净 clone 按 README 在 10 分钟内完成安装和启动；生产构建命令退出码为 0。
- **AC-02 组件目录：** 8 种规定组件均有运行时 Schema、默认值、属性编辑配置和渲染映射；未知类型或未知必填属性被拒绝并显示路径级错误。
- **AC-03 共享状态：** 人工编辑和 WebMCP 写操作都只通过同一命令运行时；测试能证明两种入口产生等价状态转换。
- **AC-04 实时画布：** 任一成功命令后 500ms 内，无刷新地在画布和组件树看到一致结果；选中节点保持有效或回退到最近有效父节点。

### Agent 工具闭环

- **AC-05 工具发现：** 支持 WebMCP 的浏览器环境能发现全部 8 个工具；名称、说明、输入 Schema 与文档一致。
- **AC-06 只读工具：** `describe_app` 和 `list_components` 返回当前版本与稳定 ID，连续调用不改变 AppSpec、历史或持久化数据。
- **AC-07 写工具：** add/update/move/remove 各有至少一个成功集成测试；结果包含变化 ID，画布与组件树同步。
- **AC-08 原子校验：** 非法类型、非法 props、未知 ID、循环移动和越界位置均失败；失败前后 AppSpec 深度相等，且错误包含可操作路径。

### 人类控制与恢复

- **AC-09 确认边界：** remove 在未确认或拒绝时不改变 AppSpec；确认后只删除目标子树，并记录影响节点。
- **AC-10 撤销：** 至少对 add、update、move、remove 各验证一次撤销；撤销后 AppSpec 与操作前深度相等，连续 20 次命令可按逆序恢复。
- **AC-11 操作日志：** 每个命令显示来源（human/agent）、命令名、状态、时间和参数摘要；敏感/大字段截断，不记录浏览器凭据。
- **AC-12 持久化恢复：** 刷新后恢复最后一次有效状态；损坏或旧版本数据不会白屏，可回退 CRM 模板或空白模板并提示原因。

### 体验、质量与比赛交付

- **AC-13 演示稳定性：** CRM 主演示流程连续完整运行 3 次无阻断；每次不超过 3 分钟，且至少包含读取、三类写操作、拒绝确认、确认删除和撤销。
- **AC-14 可理解性：** 首屏在 10 秒内能识别组件树、画布、属性面板和日志；1280×720 录屏下关键文本可读，不依赖开发者工具解释状态。
- **AC-15 自动化门禁：** format/lint、typecheck、unit/integration、e2e、production build 全部退出码为 0；无被跳过的 MVP 关键测试。
- **AC-16 生产部署：** 公网 HTTPS 地址在无登录的新浏览器会话可打开，首屏无致命控制台错误，CRM 模板及 WebMCP 能力检查通过。
- **AC-17 仓库交付：** README 包含价值主张、架构、安装、测试、浏览器要求、演示步骤、限制、部署地址和许可证；仓库不含凭据或本地绝对路径。
- **AC-18 提交包：** 具备可访问仓库、生产 URL、2–3 分钟演示视频、项目描述、至少 3 张截图和逐项官方规则核对表；提交前由人最终确认。

## 8. 失败、并发与安全

- 运行时按命令串行提交；同一时刻只允许一个写命令改变 AppSpec。
- 工具重复调用不做隐式幂等保证，但每次返回唯一 `commandId` 并留下可撤销记录。
- 执行中抛错时回滚整条命令并保留最后有效状态。
- 对删除、递归影响多个节点等破坏性命令要求显式确认。
- WebMCP 工具不接受任意代码、URL、选择器或文件路径。
- 日志和提交资料不得包含令牌、cookie、签名 URL 或私人数据。

## 9. 证据策略

- 每个 Stage 在 `docs/evidence/YYYY-MM-DD-phase-<N>-verification.md` 记录实际命令、退出码和人工观察。
- 自动化结果以可重跑命令为主；截图只证明布局和浏览器可见行为。
- 每条 AC 必须映射到至少一项证据；未运行、阻塞和已有失败必须明确区分。
- Stage 5 关闭时生成最终 AC-01～AC-18 追踪表，不允许以口头确认替代证据。

## 10. 开放项与默认决策

- WebMCP 当前浏览器实现差异：Stage 0 通过适配层 spike 决定；失败时可用本地协议 shim 做开发，但 Stage 5 必须在比赛认可的真实环境通过。
- json-render 的具体 API：Stage 0 固化版本和最小渲染契约。
- 生产托管平台：默认选择最快能提供公开 HTTPS 和可重复部署的平台；部署属于外部操作，执行前单独确认。
- 比赛官方要求：Stage 5 必须在提交当天从官方来源复核；本文不替代官方规则。
