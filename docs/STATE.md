# 项目状态

本文档记录当前已验证的状态快照。保持简短；历史细节应进入 Git 历史、计划、决策或验证证据。

## 当前快照

- 更新时间：2026-09-02
- 项目：`json-render-ai`
- 方向：基于 json-render 的低代码工作台，通过 WebMCP 暴露自身编辑能力
- 活跃阶段：Stage 4 — 演示产品化
- 阶段状态：`in_progress`
- 最近已验证里程碑：Stage 3 Catalog 属性面板、显式删除确认、20 步撤销、50 条安全日志和最后有效状态恢复通过

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

## 待确认决策

- 生产托管平台和真实比赛提交环境。

## 阻塞项

- 当前没有已记录的实现阻塞。
- 当前没有 Stage 4 实现阻塞。

## 下一步

围绕三分钟 CRM 故事补齐演示引导、可理解失败态、1280×720 视觉门和连续 3 次完整演示计时证据。
