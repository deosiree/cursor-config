# 扫描-JSON词条检测 设计说明

- 使用 `scripts/check-russian.js --mode detect`，不是手动检测
- 字符预算算法：byteLimit - (已有单字节字符数) 后 ÷ 2 = 可写入俄文字母数
- 输出路径保持与输入一致的相对目录结构
