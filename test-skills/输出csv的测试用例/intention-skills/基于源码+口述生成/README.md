# 基于源码+口述生成

无 test.ts 时通过口述或阅读 views/components 源码撰写 cases 并生成 CSV。

## 用法

用户说「根据口述整理租户管理页面 UI 用例」：
1. 追问 moduleId、模块名、outputPath、创建人员
2. 将口述碎片拆为独立用例
3. 走 config 生成 → CSV
