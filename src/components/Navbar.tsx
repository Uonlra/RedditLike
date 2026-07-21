import { SignInButton, UserButton, useUser } from "@clerk/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { FaPlus, FaReddit, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDowndown";
import SearchBar from "./SearchBar";

/**
 * Navbar — 固定顶栏。
 *
 * ── 知识点：fixed 顶栏 ──
 *   fixed top-0 w-full z-50（或 z-[100]）钉在视口顶部。
 *   脱离文档流 → Layout 的 main 必须 pt-16 垫高，否则内容被挡住。
 *   文档：https://tailwindcss.com/docs/position#fixed-positioning
 *
 * ── 知识点：碎片断点 → max-md / md: ──
 *   原 CSS：@media (max-width: 768px) { .site-name { display: none } }
 *   迁移：hidden md:inline
 *     - 无前缀 hidden = 移动端基线隐藏
 *     - md:inline = ≥768px 显示
 *   与 Day 4 的 min-first 心智一致。
 *   文档：https://tailwindcss.com/docs/responsive-design
 *
 * ── 知识点：relative 父级给 absolute 子级 ──
 *   dropdown-container 必须 relative，CreateDropdown 的 absolute 菜单才贴着「+」按钮。
 *   删掉 Navbar.css 后，relative 必须写在这里，否则菜单飞到页面边缘。
 *
 * ── 知识点：任意值与品牌色 ──
 *   h-[49px]、max-w-[1248px]、bg-[#FF4500]：设计稿精确值用方括号。
 *   文档：https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values
 *
 * ── 知识点：[&_svg]:size-5 ──
 *   任意变体：选中当前元素下的 svg，设宽高 1.25rem。
 *   替代旧 CSS .icon-button svg { width/height: 20px }。
 */

const iconButtonClassName =
  "flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 hover:bg-black/10 [&_svg]:size-5 [&_svg]:text-gray-900";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-[100] h-[49px] w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1248px] items-center justify-between gap-2 px-5">
        <Link
          to="/"
          className="flex items-center text-inherit no-underline hover:opacity-80"
          aria-label="返回首页"
        >
          <div className="flex min-w-fit cursor-pointer items-center gap-2 rounded-xs px-2 py-0.5 hover:bg-black/10">
            <FaReddit className="size-8 text-[#FF4500]" />
            {/* 移动端隐藏站点名，md 以上显示 */}
            <span className="hidden whitespace-nowrap text-[1.375rem] font-medium text-gray-900 md:inline">
              reddit
            </span>
          </div>
        </Link>

        <SearchBar />

        <div className="flex min-w-fit items-center gap-1">
          <Unauthenticated>
            <SignInButton mode="modal">
              <button
                type="button"
                className="h-8 min-h-8 min-w-20 cursor-pointer whitespace-nowrap rounded-full border-0 bg-[#FF4500] px-4 text-sm font-bold text-white hover:bg-[#FF5722]"
              >
                登录
              </button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            {/* relative：CreateDropdown 的 absolute 菜单锚点 */}
            <div className="relative">
              <button
                type="button"
                className={iconButtonClassName}
                onClick={() => setShowDropdown((isOpen) => !isOpen)}
                aria-label="创建"
              >
                <FaPlus />
              </button>
              <CreateDropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
              />
            </div>

            <button
              type="button"
              className={iconButtonClassName}
              onClick={() => user?.username && navigate(`/u/${user.username}`)}
              title="查看个人主页"
              aria-label="查看个人主页"
            >
              <FaUser />
            </button>

            <UserButton />
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
