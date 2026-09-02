# 路线图

本文档只描述阶段顺序和依赖关系，不包含任务级实现步骤或易过期的进度记录。

## 状态说明

| 状态          | 含义                           |
| ------------- | ------------------------------ |
| `draft`       | 范围仍在整理                   |
| `ready`       | 入口门已满足，可以开始执行     |
| `in_progress` | 正在实施                       |
| `blocked`     | 存在明确门禁，无法继续有效推进 |
| `verified`    | 已用证据通过退出门             |
| `deferred`    | 明确不属于当前交付目标         |

状态值保留英文，便于工具和脚本稳定解析。

## 阶段模型

权威产品范围见 [`specs/2026-09-02-webmcp-builder-mvp.md`](specs/2026-09-02-webmcp-builder-mvp.md)。阶段只能按依赖顺序进入，除 Stage 0 外均要求上一阶段已具证据并标记为 `verified`。

| 阶段                 | 目的                                                              | 必须产出                                         | 状态          |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------ | ------------- |
| 0. 契约与风险验证    | 冻结 AppSpec、Catalog、Command 与真实 WebMCP/json-render 适配边界 | 可运行 spike、权威契约、工具注册证明             | `verified`    |
| 1. 最小运行时闭环    | 让一条人工结构化修改经过统一运行时更新实时画布                    | 可启动工作台、CRM 模板、人工 add/update 和校验   | `verified`    |
| 2. WebMCP Agent 编辑 | 让 Agent 用结构化工具安全读写同一 AppSpec                         | 8 个可发现工具、add/update/move/remove 闭环      | `verified`    |
| 3. 人工控制与恢复    | 让失败和破坏性修改可理解、可拒绝、可撤销、可恢复                  | 属性面板、确认、日志、20 步撤销、持久化恢复      | `verified`    |
| 4. 演示产品化        | 把能力组合成三分钟内稳定、清晰的比赛故事                          | 完整 CRM 演示路径、失败态、视觉和 E2E 门禁       | `in_progress` |
| 5. 比赛交付          | 在干净环境和生产环境证明 MVP 可提交                               | 公网部署、README、视频、截图、规则核对和最终证据 | `draft`       |

## 阶段计划

| 阶段 | 执行计划                                                                                     | 主要验收            |
| ---- | -------------------------------------------------------------------------------------------- | ------------------- |
| 0    | [`plans/phase-0-contract-and-risk.md`](plans/phase-0-contract-and-risk.md)                   | AC-02、AC-05、AC-08 |
| 1    | [`plans/phase-1-runtime-vertical-slice.md`](plans/phase-1-runtime-vertical-slice.md)         | AC-01～AC-04        |
| 2    | [`plans/phase-2-webmcp-agent-editing.md`](plans/phase-2-webmcp-agent-editing.md)             | AC-03、AC-05～AC-09 |
| 3    | [`plans/phase-3-human-control-and-recovery.md`](plans/phase-3-human-control-and-recovery.md) | AC-04、AC-09～AC-12 |
| 4    | [`plans/phase-4-demo-productization.md`](plans/phase-4-demo-productization.md)               | AC-13～AC-15        |
| 5    | [`plans/phase-5-submission-release.md`](plans/phase-5-submission-release.md)                 | AC-01、AC-15～AC-18 |

## 依赖规则

- 后续阶段不能替未验证的前置契约兜底。
- 最高风险的架构假设应在阶段 1 验证，不能拖到打磨阶段。
- 每个阶段必须产出可演示的纵向结果，不能只交付基础设施。
- 延后事项必须注明原因和重新启用条件。
- 任一阶段的严格退出门未满足时，后续阶段只能做隔离研究，不能接入主线或标记完成。
- Stage 4 前禁止启动延后功能；Stage 5 前不得把本地演示描述为比赛可交付。

## 变更控制

调整阶段顺序、新增阶段或扩大退出条件时，必须说明：

1. 变更原因。
2. 对当前阶段和截止时间的影响。
3. 更新后的非目标。
4. 继续执行前取得用户明确确认。
