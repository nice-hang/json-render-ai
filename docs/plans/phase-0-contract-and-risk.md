# 阶段 0：契约与风险验证

- 状态：`verified`
- 权威规格：[`../specs/2026-09-02-webmcp-builder-mvp.md`](../specs/2026-09-02-webmcp-builder-mvp.md)
- 依赖：用户确认 MVP 边界；可安装项目依赖
- 目标结果：用最小可运行代码证明 json-render 渲染和 WebMCP 工具注册可被稳定封装，并冻结后续阶段使用的契约。

## 范围

- 初始化 React + TypeScript + Vite 工程、质量脚本和测试骨架。
- 固定 json-render、WebMCP 与校验库版本，记录浏览器要求。
- 定义 AppSpec、8 组件 Catalog、Command/CommandResult 契约。
- 完成两个隔离 spike：最小 json-render 页面；一个可发现并返回静态 AppSpec 的 WebMCP 工具。
- 明确真实协议与开发测试 shim 的边界。

## 非目标

- 不做完整工作台 UI、写工具、撤销或持久化。
- 不为绕过真实 WebMCP 验证而把 shim 当作最终实现。
- 不引入后端、认证或数据库。

## 入口门

- [x] 用户确认 MVP 规格 AC-01～AC-18 和 Stage 0～5 边界。
- [x] 已记录当前工作树基线，现有 README/docs 修改被保留。
- [x] 可访问所需包及至少一个比赛认可的 WebMCP 浏览器环境。
- [x] 已确认本阶段只修改工程骨架、`src/core/`、`src/adapters/`、测试和文档。

## 架构与约束

- 状态所有者：`src/core/store`
- 公开契约：`src/core/spec`、`src/core/catalog`、`src/core/commands`
- 协议边界：`src/adapters/webmcp`
- 安全边界：工具输入不得接受任意代码、URL、DOM selector 或文件路径。
- 刻意简化：spike 只注册只读工具；写能力在 Stage 2 实现。

## 执行门

| 门禁 | 要求                                             | 通过证据                   |
| ---- | ------------------------------------------------ | -------------------------- |
| G0.1 | json-render 的固定版本能渲染最小 AppSpec         | 浏览器检查 + 聚焦测试      |
| G0.2 | 真实 WebMCP 环境能发现并调用一个工具             | 工具发现截图/录屏 + 返回值 |
| G0.3 | AppSpec 与 Catalog Schema 可在运行时拒绝无效输入 | 单元测试输出               |

任一门失败必须记录 API 差异和替代方案；G0.1 或 G0.2 未通过时，Stage 1 不得标记 `ready`。

## 任务

- [x] **0.1 初始化可验证工程骨架**
      Spec ref: `MVP 规格 > 5.2 建议技术栈`
      What to build: 建立应用、lint/format、typecheck、unit、e2e、build 脚本和 CI 入口；锁定包管理器及运行时版本。
      Acceptance: 干净安装后所有空基线命令退出码为 0，README 写明精确命令。
      Verify: `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build`

- [x] **0.2 固化 AppSpec、Catalog 与命令契约**
      Spec ref: `MVP 规格 > 6. 公开契约`
      What to build: 定义版本化类型和运行时 Schema；为 8 个组件提供默认值、属性 Schema 和允许子节点规则。
      Acceptance: 覆盖合法最小规格，以及未知类型、重复 ID、孤儿、环、非法属性 5 类失败；错误包含路径。
      Verify: `pnpm test -- src/core`

- [x] **0.3 验证 json-render 适配边界**
      Spec ref: `MVP 规格 > AC-02`
      What to build: 将最小 AppSpec 经单一 adapter 映射并渲染 Page、Stack、Text；记录 API 限制。
      Acceptance: 页面不依赖 mock 渲染器；修改 Text prop 后画布更新；无致命控制台错误。
      Verify: `pnpm test:e2e -- --grep "json-render spike"`

- [x] **0.4 验证真实 WebMCP 工具发现**
      Spec ref: `MVP 规格 > AC-05`
      What to build: 在 adapter 中注册 `describe_app` spike，返回固定版本和节点摘要；提供测试 shim 但不侵入 core。
      Acceptance: 真实环境能发现工具、Schema 与返回结构；卸载页面时不重复注册；shim 契约测试与真实 adapter 一致。
      Verify: `pnpm test -- src/adapters/webmcp && pnpm test:e2e -- --grep "WebMCP discovery"`

## 严格退出门

- [x] G0.1、G0.2、G0.3 全部有最新证据，不接受仅 shim 通过。
- [x] AC-02 的 Catalog 契约与 AC-05 的工具注册方式已被 spike 证明可行。
- [x] 所有基线质量命令退出码为 0。
- [x] 两个 spike 在全新浏览器会话可复现，且没有未解释的致命控制台错误。
- [x] 已记录精确依赖版本、浏览器版本、已知协议限制和适配决策。
- [x] `docs/STATE.md` 已更新，用户已授权按 Stage 0 → Stage 5 连续推进。

## 证据

- `../evidence/2026-09-02-phase-0-verification.md`

## 回滚或降级

若真实 WebMCP 不可用，保留纯 core 契约和隔离 spike，不开始产品实现；记录阻塞，不把测试 shim 对外宣称为比赛能力。

## 最终交接

- 已交付：固定契约、可运行骨架、两个风险 spike。
- 遗留风险：真实浏览器兼容差异。
- 下一道门：Stage 0 全部严格退出门通过。
- 下一动作：实现 Stage 1 的共享运行时纵向切片。
