---
name: 路由-选择功能子skill
description: 当当前目标已经收敛到“这一步该进入哪个源码级功能 skill”，并需要在必要时借助链路分析辅助判断时使用。
---

# 路由-选择功能子skill

## RED

- 没有本节点时，agent 容易在“当前一步选哪个功能 skill”问题上：
  - 直接给总方案
  - 直接进入源码实现
  - 或在 gap 不明确时硬猜功能节点

## GREEN

- 本节点只做单次功能路由
- gap 明确时直接选节点
- gap 不明确但仍属于单步功能路由时，可先消费 `[[../分析-i18n链路]]`
- 输出必须包含主节点、备选节点排除理由和返回条件

## REFACTOR

- 若用户其实需要多个方案比较，回退到 `[[../编排-i18n迁移]]`
- 若用户其实需要的是“无旧 i18n 后的新增阶段策略”，回退到 `[[../策略-新增新i18n]]`
- 若问题已经明确是某个功能节点，不要再堆路由分析正文

## 功能目标

这个节点是单次 router，不是总编排器。

它的职责是：

- 在当前上下文中判断最适合进入哪个 `feature-skill`
- 必要时借助 `[[../分析-i18n链路]]` 做一次轻量链路推理
- 给出主节点与备选节点的排除理由

## 当前能力缺口分类

1. `runtime_not_installed`
2. `runtime_packages_ready_but_scaffold_missing`
3. `lang_switch_entry_needed`
4. `migration_shell_bridge_preserve_needed`
5. `runtime_standardization_needed`
6. `qiankun_language_sync_needed`
7. `locale_catalog_ready_needed`
8. `template_runtime_consumption_needed`
9. `script_setup_runtime_text_unmigrated`
10. `pure_ts_global_i18n_needed`
11. `trans_key_boundary_needed`
12. `dynamic_or_rules_callback_t_needed`
13. `custom_i18n_wrapper_cleanup_needed`
14. `old_variable_key_needs_chinese_t`
15. `i18n_input_form_wire_integration`
16. `i18n_input_read_side_v1_display`
17. `i18n_input_cache_projection_upgrade`

## 工作流

1. 判断当前 gap 是否可直接识别
2. 若不可直接识别，但仍属于单次功能路由问题，先引用 `[[../分析-i18n链路]]` 的事实
3. 产出 `candidateFeatureSkills`
4. 选择 `selectedFeatureSkill`
5. 给出排除理由、前置条件与返回条件

## 路由规则

- 未装依赖：进入 `[[../../feature-skills/新i18n-安装插件]]`
- 依赖装了但 `src/i18n` 等骨架未建：进入 `[[../../feature-skills/新i18n-样板代码]]`
- 需要迁移基座语言选择器与语言常量：进入 `[[../../feature-skills/新i18n-基座-语言选择器]]`
- 需要迁移微服务全局入口中的语言选择、布局大小、主题切换：进入 `[[../../feature-skills/新i18n-微服务-语言选择器]]`
- 结构树已迁到新位置，但仍放旧方案、尚未替换样板：进入 `[[../../feature-skills/迁移i18n-壳层接缝保留]]`
- 需要打通 qiankun 主子应用语言同步：进入 `[[../../feature-skills/迁移i18n-微服务-qiankun]]`
- locale JSON 缺 key、value 错或粒度不适合统一消费：进入 `[[../../feature-skills/新i18n-补充翻译json]]`
- template 中仍有静态文案、本地 translations 或旧消费样板：进入 `[[../../feature-skills/新i18n-Vue模板中使用$t()]]`
- 纯 TS / util / request / helper 中需要直接 `import i18n` 并使用 `i18n.global.t(...)`：进入 `[[../../feature-skills/新i18n-纯ts中用i18n.global.t]]`
- `script setup` / 组件内 TS / computed / notification 中仍有运行时硬编码文案：进入 `[[../../feature-skills/新i18n-ts或script setup中使用t(),可以包变量]]`
- 编译宏外定义点需要 `trans()` 标记，消费点还要再 `t()`：进入 `[[../../feature-skills/新i18n-编译宏外的定义点包trans+消费点包t]]`
- util / helper / formRules 需要业务层回调 `t`：进入 `[[../../feature-skills/新i18n-动态拼接：业务层回调t到函数定义]]`
- 组件已接入新方案，但仍保留自定义 i18n 函数或本地 translations：进入 `[[../../feature-skills/旧i18n-清理自定义的i18n函数]]`
- 变量包仍沿用旧 key，必须改写为中文再包 `t()`：进入 `[[../../feature-skills/迁移i18n-变量改写为中文再包t]]`
- 业务字段首次接 I18nInput、表单 wire 提交/回填：进入 `[[../../feature-skills/新增-i18nInput-表单字段]]`
- wire 已有但列表/侧栏/面包屑读侧要 resolve 展示（V1）：进入 `[[../../feature-skills/新增-i18nInput-读侧展示]]`
- 切换语言导航不更新、要写缓存双字段投影：进入 `[[../../feature-skills/更新-i18nInput-缓存投影]]`

## 输出

每轮至少输出：

- `routingGoal`
- `currentGapClassification`
- `candidateFeatureSkills`
- `selectedFeatureSkill`
- `whyThisFeatureSkill`
- `whyNotOtherFeatureSkills`
- `prerequisites`
- `expectedArtifacts`
- `returnToParentWhen`
- `analysisUsed`
- `analysisGapsRemaining`

## Guardrails

- 一次只推荐 1 个主功能 skill
- 若问题已上升为策略或总编排问题，返回父 skill 或引导进入其他意图 skill
- 不允许把多节点执行序列伪装成单次功能路由

## 使用示例

```text
我只想知道当前一步该选 locale、模板还是 TS 运行时相关的功能 skill。
```

```text
gap 还不完全明确，但我仍然只想收敛到一个当前最优先的实现节点。
```

```text
如果这个问题其实已经需要总方案，请不要硬路由，直接告诉我该切到哪个意图 skill。
```

```text
我还不能确认是 locale、模板还是 TS 运行时问题，但我仍然只想先收敛出一个当前最优先的功能节点。
```
