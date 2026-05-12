/**
 * 表单校验规则工厂
 *
 * 职责：
 * 负责组装规则结构、封装校验逻辑，供页面生成最终 rules。
 *
 * 规则生成流：
 * form-validation.ts 提供消息标识
 * -> formRules.ts 组装规则工厂
 * -> 页面/组合式函数生成 computed rules
 * -> ElForm 执行校验
 *
 * i18n 流：
 * 规则中的 message 在工厂执行时通过 `i18n.global.t` 生成。
 * 页面侧请用 `computed` 生成 rules，并在计算函数内读取 `i18n.global.locale.value`
 *（例如首行 `void i18n.global.locale.value`），以便切换语言后规则对象与文案会重建。
 */

import type { FormItemRule } from "element-plus";

import i18n from "@/i18n";
import { MSG } from "@/constants/form-validation";

export { MSG } from "@/constants/form-validation";

const t = (key: string) => i18n.global.t(key);
