import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/SearchBar.css";

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
    <form className="search-wrapper" onSubmit={handleSubmit} role="search">
      <div className="search-container">
        <FaSearch className="search-icon" aria-hidden="true" />
        <input
          type="search"
          className="search-input"
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
          <div className="search-scope">
            <span>r/{currentSubreddit}</span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="search-results">
          {!shouldSearch ? (
            <div className="empty-state">
              <p>
                {currentSubreddit
                  ? "搜索当前社区中的帖子。"
                  : "搜索社区。"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="empty-state">
              <p>搜索中...</p>
            </div>
          ) : results && results.length > 0 ? (
            <ul className="results-list">
              {results.map((result) => (
                <li key={`${result.type}-${result._id}`}>
                  <button
                    type="button"
                    className="result-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="result-icon">{getLabelForType(result.type)}</span>
                    <span className="result-content">
                      <span className="result-title">{result.title}</span>
                      <span className="result-subtitle">
                        {result.type === "post" ? `r/${result.name}` : `r/${result.name}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>没有找到结果。</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
