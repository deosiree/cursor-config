# 冗余审计（0616 Darwin 优化前）

| 类型 | 位置 | 处置 | 状态 |
|------|------|------|------|
| 过时触发 | `evals/should-trigger-prompts.md`「用例结果必填」 | 改为合并格式描述 | ✅ round1 |
| 历史 eval 矛盾 | `evals/*-0610.md`、`menu-login-0615.md` | 加历史头，正文不动 | ✅ round1 |
| 子 skill 过时 | `撰写UI交互cases` description「expected→用例结果」 | 修正 | ✅ round1 |
| 路径 C 过时 | `基于源码+口述生成`「需填用例结果」 | 修正 | ✅ round1 |
| v1/v2 路由并列 | `SKILL.md` GREEN 表 | v2 默认 + Legacy 分区 | ✅ round2 |
| 脚本速查膨胀 | `SKILL.md` 7 条 | 收敛为 3 条默认 + README | ✅ round2 |
| 禁止清单缺失 | `csv-export-format-rules.md` | 新增 §Agent 禁止清单 | ✅ round1 |
| login 模板不一致 | `append_ui` DOMAIN map | `login-logout.csv` → `login.csv` | ✅ round1 |
| 一次性脚本上架 | `patch_tenant_expected.py`、`bootstrap_menu_cases.py` | 待归档（P2，需 CHECKPOINT） | 未做 |
| evals 双份 test-prompts | 根目录 + evals/ | 待合一（P2） | 未做 |
| intention 合并 | `边开发边输出UI用例` + `基于源码+口述` | 可选 P3 | 未做 |

## 仍值得优化（边际收益递减区）

1. **dim8 full_test 覆盖**：仅 tenant 单模块实跑；其余 9 条 test-prompt 仍为 dry_run 路由推演
2. **README 0610/0616 双时间线**：可增「当前默认路径」单段，但 SKILL 已收敛
3. **scripts/archive/**：一次性脚本退役，收益低、需人工确认 v1 是否仍用
