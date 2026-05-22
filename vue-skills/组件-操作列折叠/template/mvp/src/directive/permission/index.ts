/**
 * @file 按钮与角色权限：v-hasPerm / v-hasRole 指令及 checkHasPerm 共用判断。
 * @module directive/permission
 */

import type { Directive, DirectiveBinding } from "vue";

import { useUserStore } from "@/store";
import { Storage } from "@/utils/storage";
import { hasPermissionBypass } from "@/utils/permission-bypass";

// ========== 权限判断（指令与 OpItem 共用） ==========

/**
 * 判断当前用户是否拥有所需权限码（与 v-hasPerm 同权）。
 * @param requiredPerms - 单个权限码或满足其一的权限码数组；未传时视为通过
 * @returns 有权限或 bypass 时为 true；明确无权限为 false
 * @remarks OpItem 在 onBeforeMount 用返回值控制 v-if，避免无权限节点进入溢出扫描与列宽计算。
 */
export function checkHasPerm(requiredPerms?: string | string[]): boolean {
  if (!requiredPerms) return true;

  if (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms)) {
    return true;
  }

  const userInfo = Storage.get("userInfo") as Record<string, unknown> | null;
  if (hasPermissionBypass(userInfo)) return true;

  const perms = (userInfo?.perms as string[] | undefined) ?? [];
  if (!perms.length) return true;

  return Array.isArray(requiredPerms)
    ? requiredPerms.some((perm) => perms.includes(perm))
    : perms.includes(requiredPerms);
}

// ========== 指令 ==========

/**
 * 按钮权限指令：无权限时从 DOM 移除节点。
 */
export const hasPerm: Directive = {
  /**
   * 挂载时校验 binding 并移除无权限元素。
   * @param el - 绑定指令的 DOM 节点
   * @param binding - 指令绑定值，须为权限码或权限码数组
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredPerms = binding.value;
    if (!requiredPerms || (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms))) {
      throw new Error(
        "需要提供权限标识！例如：v-has-perm=\"'sys:user:add'\" 或 v-has-perm=\"['sys:user:add', 'sys:user:edit']\""
      );
    }

    if (!checkHasPerm(requiredPerms) && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};

/**
 * 角色权限指令：无对应角色时从 DOM 移除节点。
 */
export const hasRole: Directive = {
  /**
   * 挂载时校验 binding 并移除无角色元素。
   * @param el - 绑定指令的 DOM 节点
   * @param binding - 指令绑定值，须为角色或角色数组
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredRoles = binding.value;

    if (!requiredRoles || (typeof requiredRoles !== "string" && !Array.isArray(requiredRoles))) {
      throw new Error(
        "需要提供角色标识！例如：v-has-role=\"'ADMIN'\" 或 v-has-role=\"['ADMIN', 'TEST']\""
      );
    }

    const { roles } = useUserStore().userInfo;

    const hasAuth = Array.isArray(requiredRoles)
      ? requiredRoles.some((role) => roles.includes(role))
      : roles.includes(requiredRoles);

    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};
