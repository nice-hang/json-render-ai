# 阶段 2：WebMCP Agent 编辑

- 状态：`verified`
- 权威规格：[`../specs/2026-09-02-webmcp-builder-mvp.md`](../specs/2026-09-02-webmcp-builder-mvp.md)
- 依赖：Stage 1 `verified`
- 目标结果：真实浏览器 Agent 可发现 8 个 Builder 工具，并通过它们安全读取和修改与人工 UI 共享的 AppSpec。

## 范围

- 完成 move、remove、undo 的 core 命令契约，其中 remove 先实现确认令牌边界。
- 注册 8 个 WebMCP 工具并映射到同一 Command Runtime。
- 工具返回统一结构化结果，UI 即时反映变化。
- 建立真实 adapter、测试 shim 和契约测试。

## 非目标

- 不让 CRM 应用本身暴露业务工具。
- 不允许工具直接操作 DOM、Store 或 json-render 内部对象。
- 不实现任意 patch、批处理或自然语言生成 AppSpec。

## 入口门

- [x] Stage 1 的人工纵向闭环和原子失败证据通过。
- [x] 真实 WebMCP 环境、工具调试方法和浏览器版本已记录。
- [x] 所有工具输入均可由 Catalog/Command Schema 表达。

## 执行门

| 门禁 | 要求                           | 通过证据            |
| ---- | ------------------------------ | ------------------- |
| G2.1 | 所有工具只调用公开 runtime API | adapter 契约测试    |
| G2.2 | remove 没有确认不能提交        | core + adapter 测试 |
| G2.3 | move 拒绝环、根移动和非法位置  | 不变量测试          |

## 任务

- [x] **2.1 补齐 move/remove/undo 命令**
      Spec ref: `MVP 规格 > 6.1 AppSpec 最小形态、AC-08～AC-10`
      What to build: 实现节点移动、递归删除影响预览、确认后删除和单步撤销入口。
      Acceptance: move 保持单父、无环、无孤儿；remove 未确认返回 `requiresConfirmation` 且状态不变；确认后仅删除目标子树。
      Verify: `pnpm test -- src/core/commands/move src/core/commands/remove src/core/history`

- [x] **2.2 注册只读与校验工具**
      Spec ref: `MVP 规格 > AC-05、AC-06`
      What to build: 注册 describe/list/validate，提供稳定 ID、当前版本、Catalog 摘要和路径化错误。
      Acceptance: 连续调用 10 次，AppSpec、历史长度、localStorage 均不变；返回值可 JSON 序列化。
      Verify: `pnpm test -- src/adapters/webmcp/read-tools`

- [x] **2.3 注册写工具并统一结果**
      Spec ref: `MVP 规格 > AC-07～AC-09`
      What to build: 注册 add/update/move/remove/undo，并将 CommandResult 安全映射为工具结果。
      Acceptance: 每个工具在真实环境至少成功调用一次；非法参数不进入 runtime 提交；结果包含 commandId 和 changedNodeIds。
      Verify: `pnpm test -- src/adapters/webmcp/write-tools && pnpm test:e2e -- --grep "agent editing"`

- [x] **2.4 验证人机共享状态闭环**
      Spec ref: `MVP 规格 > AC-03、AC-04`
      What to build: E2E 先由 UI update，再由 Agent add/move，最后 UI 再 update；全程断言相同 AppSpec 版本递增和画布一致。
      Acceptance: 三种修改无需刷新；任意入口失败都不影响后续成功命令；选中节点规则稳定。
      Verify: `pnpm test:e2e -- --grep "shared human agent state"`

## 严格退出门

- [x] 真实环境发现的工具恰好包含规定 8 个名称，Schema 与文档一致。
- [x] add/update/move/remove 各有真实调用和自动化成功证据。
- [x] 未知 ID、非法属性、成环移动、未确认删除均有原子失败证据。
- [x] 人工与 Agent 交替修改同一 AppSpec，无刷新且画布/树一致。
- [x] 所有 adapter 契约、类型检查、测试、生产构建退出码为 0。
- [x] 没有把 shim 结果当作真实协议证据；`docs/STATE.md` 已更新且用户已在执行 Prompt 中确认阶段交接。

## 证据

- `../evidence/2026-09-02-phase-2-verification.md`

## 回滚或降级

任何写工具不稳定时，从注册表移除该工具并将阶段保持 `blocked`；不允许保留会部分写入或绕过确认的工具。

## 最终交接

- 已交付：真实 Agent 对共享 AppSpec 的完整结构化编辑面。
- 遗留风险：多步撤销、日志隐私和刷新恢复尚待加固。
- 下一道门：8 工具和关键失败流全部在真实环境通过。
- 下一动作：补齐人工控制、审计与恢复能力。
