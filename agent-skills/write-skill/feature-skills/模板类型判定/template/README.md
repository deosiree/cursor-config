# 模板类型判定模板族

这个节点是 `write-skill` 当前唯一的模板模型真源。

## 何时看 `update-skill`

当目标任务是在已有 skill 套件上做修改、收敛、拆层、回填或收尾时，使用：

- `[[update-skill/README.md]]`
- `[[update-skill/template/before]]`
- `[[update-skill/template/after]]`

## 何时看 `add-skill`

当目标任务是从 0 新建一个 skill 套件或新增此前不存在的模板骨架时，使用：

- `[[add-skill/README.md]]`
- `[[add-skill/template/mvp]]`
- `[[add-skill/template/snapshot]]`

## 何时停止自动套模板

如果真实任务既不符合新增型，也不符合更新型：

- 输出 `human-requested-new-model`
- 进入人工门禁
- 待人类确认新模型后，再把新模型回流到本节点的 Darwin 演化中
