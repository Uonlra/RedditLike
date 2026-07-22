import { SignInButton, UserButton, useUser } from "@clerk/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { FaPlus, FaReddit, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDowndown";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";


const iconButtonClassName =
  "size-8 rounded-sm text-gray-900 hover:bg-black/10 hover:text-gray-900 [&_svg]:size-5";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-[100] h-[49px] w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full w-full max-w-312 items-center justify-between gap-2 px-5">
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
              <Button
                type="button"
                size="sm"
                className="min-w-20 shrink-0 rounded-full bg-[#FF4500] px-4 font-bold text-white hover:bg-[#FF5722]"
              >
                登录
              </Button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            {/* relative：CreateDropdown 的 absolute 菜单锚点 */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={iconButtonClassName}
                onClick={() => setShowDropdown((isOpen) => !isOpen)}
                aria-label="创建"
              >
                <FaPlus />
              </Button>
              <CreateDropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={iconButtonClassName}
              onClick={() => user?.username && navigate(`/u/${user.username}`)}
              title="查看个人主页"
              aria-label="查看个人主页"
            >
              <FaUser />
            </Button>

            <UserButton />
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
