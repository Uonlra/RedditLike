import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

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
      <div className="relative flex h-9 w-full items-center rounded-md border border-border bg-surface-2 px-3 transition-[border-color,background-color] duration-200 focus-within:border-accent focus-within:bg-surface">
        <FaSearch
          className="mr-2 shrink-0 text-sm text-text-faint"
          aria-hidden="true"
        />
        <input
          type="search"
          className="min-w-0 w-full flex-1 border-0 bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
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
          <div className="ml-2 max-w-40 truncate border-l border-border pl-2 text-xs font-semibold text-accent">
            r/{currentSubreddit}
          </div>
        )}
      </div>

      {isActive && (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-[400px] overflow-y-auto rounded-md border border-border bg-surface shadow-lg">
          {!shouldSearch ? (
            <div className="p-4 text-center text-sm text-text-subtle">
              <p className="m-0">
                {currentSubreddit
                  ? "搜索当前社区中的帖子。"
                  : "搜索社区。"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center text-sm text-text-subtle">
              <p className="m-0">搜索中...</p>
            </div>
          ) : results && results.length > 0 ? (
            <ul className="m-0 list-none py-1">
              {results.map((result) => (
                <li key={`${result.type}-${result._id}`}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full cursor-pointer items-center border-0 bg-transparent px-3 py-2 text-left text-inherit hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="mr-3 inline-flex h-6 w-[76px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
                      {getLabelForType(result.type)}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-text">
                        {result.title}
                      </span>
                      <span className="truncate text-xs text-text-subtle">
                        r/{result.name}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-text-subtle">
              <p className="m-0">没有找到结果。</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
