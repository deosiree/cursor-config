# commit-05-locale-json-fill

## 来源提交

- 提交哈希：`198a60a2215c68d0aafef7bb0110d01b497cf803`
- 短哈希：`198a60a`
- 主题：补充翻译 JSON

## 背景

补齐 locale JSON，让后续模板和运行时消费点迁移有 key 可用。

## 触发条件

- locale JSON 已建立
- 准备开始改模板或 TS 消费点
- 需要确保 key 先入库再改引用

## 改动范围

- 扩充 `en_US.json`
- 扩充 `zh_CN.json`
- 建立“先补 key，再迁移消费点”的顺序约束

## 核心文件

- `src/i18n/locales/en_US.json`
- `src/i18n/locales/zh_CN.json`

## 完成后的中间态

后续页面迁移所需的主要 key 已进入 JSON，模板迁移不会因为缺 key 反复回头补词条。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-06-vue-template-dollar-t`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
