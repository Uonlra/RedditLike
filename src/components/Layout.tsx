import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Layout — 全站壳层。
 *
 * 知识点：flex 列布局 + min-h-screen
 *   min-h-screen  = min-height: 100vh（整屏至少一屏高）
 *   flex flex-col = 纵向 flex，子项可按 flex-1 吃掉剩余高度
 *   flex-1        = flex: 1 1 0%（主内容区撑满 Navbar 下方剩余空间）
 *
 * 知识点：固定顶栏的"垫高"
 *   Navbar 是 position: fixed，脱离文档流，不占高度。
 *   所以 main 必须 padding-top 把内容顶下去，否则会被 Navbar 挡住。
 *   原 CSS 64px → Tailwind pt-16（16 × 4px = 64px）。
 *
 * 知识点：任意值 bg-[#dae0e6]
 *   Reddit 经典浅灰底不在默认色板里，用方括号写任意色值。
 *   文档：https://tailwindcss.com/docs/background-color#using-a-custom-value
 */
const Layout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#dae0e6]">
      <Navbar />
      <div className="w-full flex-1 px-4 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
