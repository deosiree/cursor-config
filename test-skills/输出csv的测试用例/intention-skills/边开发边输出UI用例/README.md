# 边开发边输出 UI 用例

在开发过程中将 UI 交互验证结论沉淀为 CSV 用例，追加写入 `docs/问题单/{MMDD}/`。

## 用法

Agent 识别到用户说「角色新增 Tab 校验失败要录入测试系统」时：
1. 确定 domain=role、date=当天
2. 按 UI 撰写规范写 4 条用例
3. 运行 `append_ui_cases_to_csv.py` 追加
4. 回报输出路径和条数
