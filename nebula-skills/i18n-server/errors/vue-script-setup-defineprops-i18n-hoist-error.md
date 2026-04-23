# Vue `script setup` 中 `defineProps` 引用 `t()` 报错经验贴

## 错误

在 `CodeField.vue` 中，将 `withDefaults(defineProps())` 的默认值写成 `buttonText: t("发送验证码")` 后，Vite 编译报错：

```text
[plugin:vite:vue] [@vue/compiler-sfc] `defineProps()` in <script setup> cannot reference locally declared variables because it will be hoisted outside of the setup() function.
```

---

## 错误原因

`defineProps` / `withDefaults` 属于 `script setup` 的编译宏，会被提升到 `setup()` 外执行；  
`t` 来自 `useI18n()`，是 `setup()` 内的局部变量。  
因此在 `withDefaults` 中引用 `t` 会触发“hoist 后无法访问局部变量”的编译错误。

简化理解：

- `defineProps`：编译期处理（提升）
- `t`：运行时在 `setup` 内创建
- 提升后的代码引用不到 `t`，所以报错

---

## 错误解决

核心修复原则：`setup` 外不要使用 `useI18n().t`，改用 `trans()` 进行词条标记。

### 5.3 非组件文件中使用

像路由、常量、枚举映射这类文件，通常拿不到 `useI18n()`，这时不要直接翻译，而是先用 `trans()` 标记词条：

```ts
import { trans } from "vue-i18n-kit-sy/runtime";

meta: {
  title: trans("首页");
}
```

`trans()` 的作用只有一个：让抽取脚本识别这是一条国际化 key。  
它在运行时只是原样返回字符串，不做翻译。真正显示时，仍然要在组件里再调用 `$t()`：

```vue
{{ $t(route.meta?.title as string) }}
```

例如项目的路由菜单渲染链路中，可以采用上述模式。

---

## 相关代码

### 错误写法（会触发编译错误）

```ts
import { useI18n } from "vue-i18n";
const { t } = useI18n();

withDefaults(
  defineProps<{
    buttonText?: string;
  }>(),
  {
    buttonText: t("发送验证码"),
  }
);
```

### 正确写法（已验证可用）

```ts
import { trans } from "vue-i18n-kit-sy/runtime";
withDefaults(
  defineProps<{
    buttonText?: string;
    countdown: number;
  }>(),
  {
    buttonText: trans("发送验证码"),
  }
);
```

```vue
{{ countdown > 0 ? $t("{countdown}s后重发", { countdown }) : $t(buttonText) }}
```

---

## 适用范围与检查清单

适用于所有 Vue3 `<script setup>` 场景：

- `defineProps`
- `withDefaults`
- `defineEmits`（同类编译期宏约束思路）

提交前快速检查：

- [ ] `defineProps/withDefaults` 默认值是否引用了 `useXxx()` 返回值
- [ ] 默认值是否为静态可提升值（字符串、数字、布尔、字面量对象等）
- [ ] i18n 默认文案是否放在模板或 `computed` 中处理

