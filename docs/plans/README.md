# 阶段计划

计划将已确认规格转换为范围明确的执行步骤。每个阶段创建一份计划：

```text
phase-<编号>-<主题>.md
```

从 [`PHASE_TEMPLATE.md`](PHASE_TEMPLATE.md) 开始编写。

## 当前 MVP 计划

| 阶段 | 计划                                                                             | 目标结果                                    |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| 0    | [`phase-0-contract-and-risk.md`](phase-0-contract-and-risk.md)                   | 固化契约并证明 json-render/WebMCP 风险边界  |
| 1    | [`phase-1-runtime-vertical-slice.md`](phase-1-runtime-vertical-slice.md)         | 人工结构化编辑实时更新共享画布              |
| 2    | [`phase-2-webmcp-agent-editing.md`](phase-2-webmcp-agent-editing.md)             | Agent 通过 8 个 WebMCP 工具读写同一 AppSpec |
| 3    | [`phase-3-human-control-and-recovery.md`](phase-3-human-control-and-recovery.md) | 确认、日志、撤销和持久化恢复                |
| 4    | [`phase-4-demo-productization.md`](phase-4-demo-productization.md)               | 三分钟内稳定讲清完整闭环                    |
| 5    | [`phase-5-submission-release.md`](phase-5-submission-release.md)                 | 生产部署和比赛提交包满足全部门禁            |

这些计划的产品行为和 AC 编号统一来源于 [`../specs/2026-09-02-webmcp-builder-mvp.md`](../specs/2026-09-02-webmcp-builder-mvp.md)，不得在单个阶段内静默扩大范围。

## 任务粒度

每项任务应当：

- 产出一个完整行为或契约。
- 在已知时列出准确文件或目录。
- 标明对应的验收标准编号。
- 包含聚焦验证方式。
- 可以独立审查和回滚。

当证据证明某项假设错误时可以修改计划，但必须记录变化，并在继续执行前重新取得确认。
