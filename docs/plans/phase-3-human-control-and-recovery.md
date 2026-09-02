# 阶段 3：人工控制与恢复

- 状态：`verified`
- 权威规格：[`../specs/2026-09-02-webmcp-builder-mvp.md`](../specs/2026-09-02-webmcp-builder-mvp.md)
- 依赖：Stage 2 `verified`
- 目标结果：用户能理解每次人/Agent 修改，拒绝破坏性操作，并从错误、撤销和刷新中恢复到已知有效状态。

## 范围

- 完成类型驱动属性面板和明确人工新增/更新/移动/删除入口。
- 实现删除确认交互、最多 50 条日志、至少 20 步可验证撤销。
- 实现最后有效 AppSpec 持久化、版本检查、损坏数据回退。
- 完整错误状态、空状态和恢复入口。

## 非目标

- 不做协同冲突解决、云同步、分支历史或 redo。
- 不记录完整敏感参数或无限历史。
- 不以 toast 代替可定位的字段/结构错误。

## 入口门

- [x] Stage 2 的 8 工具真实发现和写操作证据通过。
- [x] CommandResult、确认令牌、撤销快照契约稳定。
- [x] 日志只记录无值摘要，凭据样式脱敏，摘要最多 160 字符，Activity 最多 50 条。

## 执行门

| 门禁 | 要求                                 | 通过证据           |
| ---- | ------------------------------------ | ------------------ |
| G3.1 | 持久化永远不覆盖最后有效快照         | 损坏写入测试       |
| G3.2 | 撤销使用已提交快照，不重放不可信输入 | history 单元测试   |
| G3.3 | 日志不包含 cookie/token/完整大字段   | 安全测试与人工检查 |

## 任务

- [x] **3.1 完成 Catalog 驱动属性面板**
      Spec ref: `MVP 规格 > AC-02～AC-04`
      What to build: 按选中组件类型显示允许字段、默认值和错误；所有提交走 Command Runtime。
      Acceptance: 8 种组件均可查看属性；可编辑属性正确更新；非法输入就地报错且画布保持原值。
      Verify: `pnpm test -- src/features/inspector && pnpm test:e2e -- --grep "property inspector"`

- [x] **3.2 实现明确删除确认**
      Spec ref: `MVP 规格 > AC-09`
      What to build: UI 和 Agent 删除共享同一确认模型，展示目标、递归影响数量和取消入口。
      Acceptance: 关闭、取消、拒绝都使 AppSpec 深度相等；过期/错误确认令牌失败；确认只删除目标子树。
      Verify: `pnpm test -- src/features/confirmation src/core/commands/remove && pnpm test:e2e -- --grep "delete confirmation"`

- [x] **3.3 实现撤销栈和操作日志**
      Spec ref: `MVP 规格 > AC-10、AC-11`
      What to build: 成功写命令保存前态；日志记录来源、命令、状态、时间、摘要和撤销可用性。
      Acceptance: add/update/move/remove 均可撤销；20 条混合命令逆序恢复到初始深度相等；失败/只读命令不进入撤销栈；日志最多 50 条。
      Verify: `pnpm test -- src/core/history src/features/activity-log && pnpm test:e2e -- --grep "20 step undo"`

- [x] **3.4 实现持久化和安全恢复**
      Spec ref: `MVP 规格 > AC-12`
      What to build: 节流保存最后有效 AppSpec；启动时校验版本和内容；失败可选 CRM/空白模板。
      Acceptance: 刷新恢复深度相等；非法 JSON、未知版本、结构损坏三类 fixture 均不白屏且不覆盖原数据；用户能一键恢复模板。
      Verify: `pnpm test -- src/core/persistence && pnpm test:e2e -- --grep "persistence recovery"`

## 严格退出门

- [x] AC-09～AC-12 每条均有自动化和本地浏览器证据。
- [x] 20 步混合撤销测试精确恢复初始 AppSpec。
- [x] 删除拒绝、损坏 localStorage、非法属性三个失败流程均不丢失最后有效状态。
- [x] 日志中无凭据、完整大字段或无法区分的人/Agent 来源。
- [x] 全量质量命令和生产构建退出码为 0。
- [x] `docs/STATE.md`、证据和已知限制已更新；用户已在执行 Prompt 中确认按顺序进入 Stage 4。

## 证据

- `../evidence/2026-09-02-phase-3-verification.md`

## 回滚或降级

若持久化不可靠，必须禁用自动恢复并保持 Stage 3 未验证；不能让损坏数据覆盖内置模板。若多步撤销有缺陷，只保留已证明安全的深度并同步修改规格、演示和用户确认。

## 最终交接

- 已交付：可理解、可拒绝、可撤销、可刷新恢复的人机编辑工作台。
- 遗留风险：比赛演示节奏和视觉清晰度尚未验证。
- 下一道门：恢复和安全失败流全部通过。
- 下一动作：围绕三分钟故事完成产品化。
