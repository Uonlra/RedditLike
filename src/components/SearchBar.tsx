import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * SearchBar — Navbar 内搜索框 + 绝对定位结果下拉。
 *
 * ── 知识点：relative + absolute 下拉 ──
 *   父级 position: relative → 子级 absolute 以父级为定位参考。
 *   top-full = top: 100%（贴在父级底边）
 *   left-0 right-0 = 与父级同宽
 *   z-50 保证压在页面内容之上
 *   文档：https://tailwindcss.com/docs/position
 *
 * ── 知识点：focus-within ──
 *   当容器内任意子元素获得焦点时，容器自身匹配 :focus-within。
 *   用于"输入框聚焦时整块搜索栏变白+蓝边"，不必给 input 单独写 focus 样式。
 *   文档：https://tailwindcss.com/docs/hover-focus-and-other-states#focus-within
 *
 * ── 知识点：truncate ──
 *   truncate = overflow-hidden + text-ellipsis + whitespace-nowrap
 *   长标题/社区名单行省略号，避免撑破布局。
 *   文档：https://tailwindcss.com/docs/text-overflow
 *
 * ── 知识点：flex-1 + min-w-0 ──
 *   flex-1 让搜索框吃掉 Navbar 中间剩余宽度。
 *   min-w-0 防止 flex 子项被内容最小宽度撑开（默认 min-width: auto）。
 *   文档：https://tailwindcss.com/docs/min-width
 *
 * ── 知识点：为什么结果项用 onMouseDown preventDefault ──
 *   mousedown 在 blur 之前触发。若不 preventDefault，点结果时 input 先 blur
 *   → isActive=false → 下拉卸载 → click 丢失。这是交互逻辑，与 Tailwind 无关。
 */

type SearchResult = {
  _id: Id<"posts"> | Id<"subreddits">;
  type: "post" | "community" | string;
  title: string;
  name: string;
};

const getSubredditFromPath = (pathname: string) => {
  const match = pathname.match(/^\/r\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSubreddit = useMemo(
    () => getSubredditFromPath(location.pathname),
    [location.pathname],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const trimmedQuery = searchQuery.trim();
  const shouldSearch = trimmedQuery.length > 0;

  const subredditSearch = useQuery(
    api.subreddit.search,
    shouldSearch && !currentSubreddit ? { queryStr: trimmedQuery } : "skip",
  );
  const postSearch = useQuery(
    api.posts.search,
    shouldSearch && currentSubreddit
      ? { queryStr: trimmedQuery, subredditName: currentSubreddit }
      : "skip",
  );

  const results = (currentSubreddit ? postSearch : subredditSearch) as
    | SearchResult[]
    | undefined;
  const isLoading = shouldSearch && results === undefined;

  const closeSearch = () => {
    setIsActive(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    window.setTimeout(closeSearch, 150);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setIsActive(true);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "post") {
      navigate(`/post/${result._id}`);
    } else {
      navigate(`/r/${result.name}`);
    }

    clearSearch();
    closeSearch();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shouldSearch) return;

    if (results && results.length > 0) {
      handleResultClick(results[0]);
      return;
    }

    setIsActive(true);
  };

  const getLabelForType = (type: string) => {
    return type === "post" ? "帖子" : "社区";
  };

  return (
    <form
      className="relative mx-4 max-w-[600px] flex-1"
      onSubmit={handleSubmit}
      role="search"
    >
      {/* 输入容器：relative 供图标绝对定位参考；focus-within 改变整块外观 */}
      <div className="relative flex h-9 w-full items-center rounded-xs border border-gray-200 bg-gray-100 px-3 transition-[border-color,background-color] duration-200 focus-within:border-blue-600 focus-within:bg-white">
        <FaSearch
          className="mr-2 shrink-0 text-sm text-gray-500"
          aria-hidden="true"
        />
        <input
          type="search"
          className="min-w-0 w-full flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
          placeholder={
            currentSubreddit
              ? `在 r/${currentSubreddit} 中搜索帖子`
              : "搜索社区"
          }
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="搜索 RedditLike"
          autoComplete="off"
        />
        {currentSubreddit && (
          <div className="ml-2 max-w-40 truncate border-l border-gray-200 pl-2 text-xs font-semibold text-blue-600">
            r/{currentSubreddit}
          </div>
        )}
      </div>

      {/* 下拉：absolute + top-full，相对 form(relative) 定位 */}
      {isActive && (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-[400px] overflow-y-auto rounded-xs border border-gray-200 bg-white shadow-lg">
          {!shouldSearch ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <p className="m-0">
                {currentSubreddit
                  ? "搜索当前社区中的帖子。"
                  : "搜索社区。"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <p className="m-0">搜索中...</p>
            </div>
          ) : results && results.length > 0 ? (
            <ul className="m-0 list-none py-1">
              {results.map((result) => (
                <li key={`${result.type}-${result._id}`}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full cursor-pointer items-center border-0 bg-transparent px-3 py-2 text-left text-inherit hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="mr-3 inline-flex h-6 w-[76px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                      {getLabelForType(result.type)}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-gray-900">
                        {result.title}
                      </span>
                      <span className="truncate text-xs text-gray-500">
                        r/{result.name}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              <p className="m-0">没有找到结果。</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
