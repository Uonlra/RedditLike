import { SignInButton, UserButton, useUser } from "@clerk/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { FaPlus, FaReddit, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDowndown";
import SearchBar from "./SearchBar";

const iconButtonClassName =
  "flex size-8 min-h-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text hover:bg-surface-3 [&_svg]:size-5";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-[100] h-[49px] w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1248px] items-center justify-between gap-2 px-5">
        <Link
          to="/"
          className="flex items-center text-inherit no-underline hover:opacity-80"
          aria-label="返回首页"
        >
          <div className="flex min-w-fit cursor-pointer items-center gap-2 rounded-xs px-2 py-0.5 hover:bg-surface-3">
            <FaReddit className="size-8 text-brand" />
            <span className="hidden whitespace-nowrap text-[1.375rem] font-medium text-text md:inline">
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
                className="h-8 min-h-0 min-w-20 cursor-pointer whitespace-nowrap rounded-full border-0 bg-brand px-4 py-1 text-sm font-bold text-white hover:bg-brand-hover"
              >
                登录
              </button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
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
