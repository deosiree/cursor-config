# Darwin 内部简化闭环

## 接入模式

- `darwinIntegrationMode`: 内部简化闭环；工作区没有 `.cursor/darwin-skill`。
- `templateModelDecision`: 新增型 skill，采用 README + PowerShell 可执行资产 + evals，不复制虚构 before/after 历史。
- 评估方式：3 条迁移任务提示词，加隔离临时目录的脚本行为试跑。
- 评分维度：输入契约、默认保留边界、排除前确认、归档完整性、依赖命令准确性，各 0–2 分，总分 10。

## Baseline

对最初的需求草案按 3 条提示词进行静态基线检查；当时只有“ZIP 并排除依赖”的能力方向，尚无脚本与边界约定。

| 场景 | 得分 | 缺口 |
| --- | ---: | --- |
| 个人机器迁移并保留配置 | 4/10 | 没有明确本地文件默认保留，也没有绝对路径契约。 |
| 用户要求排除本地文件 | 5/10 | 没有候选清单、确认步骤或锁文件保护规则。 |
| 跨语言项目安装依赖 | 3/10 | 没有清单识别和目标机器命令输出规则。 |

平均 baseline：`4.0/10`。此分数针对实现前的需求草案，不代表历史上线版本。

## 受控试跑

1. 默认迁移：源路径 `F:\Documents\Repertory\Own\sub2api`，默认保留 `.git`、配置、临时与输出，只过滤嵌套依赖；应得到相邻 ZIP 和 pnpm/Go 命令。
2. 显式本地排除：调用预览后列出 `.gitignore` 与常见状态目录，预览不写 ZIP；未确认的正式调用必须失败；确认后保留 manifest/lock。
3. 边界与完整性：空格/中文路径、空目录、隐藏文件、路径错误、已有 ZIP；归档必须可读且失败不得留下最终 ZIP。

## 迭代记录

- 将 `includeLocalFiles=true` 定为默认，并把默认排除集缩至已安装依赖目录。
- 新增两阶段本地排除，脚本预览只读；正式归档要求 `-ConfirmLocalExclusions`。
- 添加完整 ZIP 结构、隐藏项、空目录、临时文件和依赖清单断言。
- 归档先写同目录临时文件，通过 ZIP 可读性检查后才移动到最终路径。

## 试跑结果与最终判断

- 隔离夹具：通过。覆盖中文/空格路径、默认保留 `.git`/`.env`/临时文件/空目录、嵌套 `node_modules`/`vendor`/`.venv` 排除、manifest/lock 保留，以及本地文件排除预览和显式确认。
- 真实迁移项目：已生成 `F:\Documents\Repertory\Own\sub2api.zip`；包含 `sub2api/` 顶层、`.git`、`frontend/package.json`、`frontend/pnpm-lock.yaml`、`backend/go.mod`。ZIP 可读取，发现 5,880 个文件条目。源目录本次未发现依赖目录，因此排除数为 0。
- 依赖命令识别：pnpm 使用 `pnpm install --frozen-lockfile`；Go 使用 `go mod download`。本机未执行安装。
- 兼容性修正：脚本使用 UTF-8 BOM 兼容 Windows PowerShell 5.1；CLI 用 `-ExcludeLocalFiles` 开关，避免 `-File` 将布尔字符串误判为 true；隔离测试通过。
- 评分：实现后 3 条场景均达到 `9/10`（路径/边界和归档完整性通过；真实项目无本地 `.env` 文件可验证具体 `.env` 条目）。

- `optimizationDecision`: 保留迭代结果。
- `keepOrRevertRule`: 隔离试跑通过，默认本地文件保留，两阶段排除不误删清单/锁文件；keep。
- `suiteCompletionStage`: 套件实现与验证完成。
