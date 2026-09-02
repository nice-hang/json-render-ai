# 项目状态

本文档记录当前已验证的状态快照。保持简短；历史细节应进入 Git 历史、计划、决策或验证证据。

## 当前快照

- 更新时间：2026-09-02
- 项目：`json-render-ai`
- 方向：基于 json-render 的低代码工作台，通过 WebMCP 暴露自身编辑能力
- 活跃阶段：Stage 5 — 比赛交付
- 阶段状态：`in_progress`
- 最近已验证里程碑：Stage 5 公共干净 clone 在 24 秒内通过安装、全量门禁、3 次原生 WebMCP 彩排与构建；公开仓库、MIT 许可证、英文 README、三张原生截图和提交草案已准备

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
- Undo 历史固定为 20 个已提交前态，Activity 固定为 50 条脱敏截断摘要；二者不跨刷新，最后有效 AppSpec 跨刷新恢复。
- Reset Demo 在同一 Runtime 内恢复 15 节点 CRM 并清空会话状态；最终三次原生 Chrome 彩排分别为 622ms、533ms、556ms。
- 公共 `main` 候选已通过干净 clone 复现：全流程 24 秒，dev server 74ms 就绪；最终 AC 矩阵当前严格为 15/18 passed。

## 待确认决策

- 生产托管平台和真实比赛提交环境；推荐选择可提供固定 HTTPS 的静态托管。
- 参赛主体的年龄、合资格居住地/组织注册地、利益冲突/支持声明、代表权限、Devpost 注册和规则同意。
- 对外部署、公开视频和比赛提交尚未授权；仅准备制品。

## 阻塞项

- 当前没有已记录的实现阻塞，也没有 Stage 5 本地制品准备阻塞。
- AC-16 因未获公网部署授权而阻塞；AC-17 仅缺经验证部署地址；AC-18 缺生产 URL、公开配音视频、参赛资格/注册确认和最终人工确认。

## 下一步

取得参赛资格和规则确认，并取得公网部署授权；随后验证生产 WebMCP、补 README URL、录制并审阅视频。实际公开视频与 Devpost 最终提交仍只在对应动作前取得明确授权后执行。
