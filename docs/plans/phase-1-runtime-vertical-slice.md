# 阶段 1：最小运行时闭环

- 状态：`verified`
- 权威规格：[`../specs/2026-09-02-webmcp-builder-mvp.md`](../specs/2026-09-02-webmcp-builder-mvp.md)
- 依赖：Stage 0 `verified`
- 目标结果：用户可以在工作台通过结构化人工操作修改 CRM AppSpec，并立即在组件树和 json-render 画布看到一致结果。

## 范围

- 建立 AppSpec Store 和唯一 Command Runtime。
- 实现 validate、add、update 三类内部命令及原子提交。
- 实现固定四栏骨架中的组件树、画布和最小编辑控件；日志区先显示基础结果。
- 提供合法 CRM 模板与空白模板。

## 非目标

- 不注册正式 WebMCP 写工具。
- 不做 move/remove、确认、完整撤销和持久化。
- 不做拖拽或动态布局设计器。

## 入口门

- [x] Stage 0 证据证明真实 json-render 和 WebMCP adapter 可行。
- [x] AppSpec/Catalog/Command 公共契约已冻结。
- [x] 现有测试基线全绿，工作树差异已记录。

## 执行门

| 门禁 | 要求                                  | 通过证据              |
| ---- | ------------------------------------- | --------------------- |
| G1.1 | Store 只能通过 Command Runtime 写入   | 模块边界测试/静态检查 |
| G1.2 | 命令失败不产生部分状态                | 深度相等断言          |
| G1.3 | CRM 与空白模板均通过完整 AppSpec 校验 | fixture 测试          |

## 任务

- [x] **1.1 建立 Store 与原子命令运行时**
      Spec ref: `MVP 规格 > 5.1 状态与数据流`
      What to build: 实现状态读取、串行 command dispatch、变更前校验、临时副本执行、提交后通知和统一结果。
      Acceptance: 成功命令只提交一次；执行/校验异常时状态深度相等且不产生历史记录。
      Verify: `pnpm test -- src/core/runtime src/core/store`

- [x] **1.2 实现 validate/add/update**
      Spec ref: `MVP 规格 > AC-02、AC-08`
      What to build: 按 Catalog 默认值新增节点、按允许属性 patch 节点、返回路径化校验错误。
      Acceptance: 每类命令至少 1 个成功与 3 个失败测试；未知 ID、非法类型和非法属性均原子失败。
      Verify: `pnpm test -- src/core/commands`

- [x] **1.3 构建 CRM/空白模板和实时画布**
      Spec ref: `MVP 规格 > AC-04、AC-12`
      What to build: CRM 模板包含 Page、Stack、Card、Text、Metric、Button、Input、Select；画布只消费 Store 的有效 AppSpec。
      Acceptance: 两个模板均通过 Schema；CRM 展示全部 8 类组件；一次 update 在 500ms 内反映到画布。
      Verify: `pnpm test -- src/templates src/components/canvas && pnpm test:e2e -- --grep "live canvas"`

- [x] **1.4 构建最小人工编辑纵向切片**
      Spec ref: `MVP 规格 > AC-03、AC-04`
      What to build: 组件树选择节点；属性区可编辑 Text 内容并新增 Metric；基础日志显示命令结果。
      Acceptance: UI 不直接写 Store；树、属性区、画布使用同一选中 ID；新增和更新都可见且刷新前状态一致。
      Verify: `pnpm test -- src/features/studio && pnpm test:e2e -- --grep "human vertical slice"`

## 严格退出门

- [x] AC-01～AC-04 的本阶段部分均有自动化或浏览器证据。
- [x] 人工完成“选中标题 → 修改 → 新增 Metric”主流程，画布和树在 500ms 内同步。
- [x] 至少验证非法属性失败流程，失败后 UI 与 AppSpec 无部分变化。
- [x] lint、typecheck、unit/integration、production build 全部退出码为 0。
- [x] 没有 UI 或 adapter 绕过 Command Runtime 写 Store。
- [x] `docs/STATE.md` 和 Stage 1 证据已更新，用户已授权连续进入 Stage 2。

## 证据

- `../evidence/2026-09-02-phase-1-verification.md`

## 回滚或降级

保留 Stage 0 spike；若完整 json-render 映射阻塞，只允许把未支持组件从固定 Catalog 明确移除并重新取得用户确认，不能用静态截图替代。

## 最终交接

- 已交付：可运行的人工编辑共享状态闭环。
- 遗留风险：真实 Agent 写调用尚未接入。
- 下一道门：人工路径和失败原子性均验证通过。
- 下一动作：把运行时命令暴露为正式 WebMCP 工具。
