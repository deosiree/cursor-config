# few-shot 索引

当前 `写skill` 默认复用三类正式案例。

## 1. 套件级真实案例

- `[[suite-cases/gen-README/README.md]]`
- `[[suite-cases/i18n-server/README.md]]`

这两类目录里已经直接放入真实实现片段，而不再只是说明文档。

## 2. Darwin 质量闭环案例

- `darwin-skill`

它的真实试跑样例已经被分发到：

- `intention-skills/编排-skill质量迭代/assets/few-shot-example/example-01`
- `feature-skills/darwin质量评估与迭代/assets/few-shot-example/example-01`

## 3. 子skill 局部 few-shot

每个 intention / feature 节点都应在自己的：

- `assets/few-shot-example/example-01/`

下提供局部真实片段，不再只依赖顶层索引。

对应方法说明见：

- `[[../references/旧skill升级为agent-skill案例说明.md]]`
- `[[../references/意图层与功能层拆分案例说明.md]]`
- `[[../references/darwin评估闭环案例说明.md]]`
