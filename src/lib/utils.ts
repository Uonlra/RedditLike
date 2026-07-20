import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — 条件类名合并工具（shadcn/ui 标准实践）。
 *
 * 知识点：为什么需要两个库
 *   clsx         — 处理条件：cn("base", isActive && "active", { hidden: !show })
 *   tailwind-merge — 解决冲突：cn("px-2", "px-4") → "px-4"（后者覆盖前者）
 *   没有 twMerge 时，两个 padding 类会同时存在，CSS 源码顺序决定胜负，不可控。
 *
 * 用法：
 *   cn("rounded-md bg-white", hasError && "border-red-500", className)
 *
 * 文档：
 *   https://github.com/lukeed/clsx
 *   https://github.com/dcastil/tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
