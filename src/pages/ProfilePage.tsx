import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";

/**
 * ProfilePage — 用户主页。
 *
 * ── 知识点：页面壳层 max-w + mx-auto + pt ──
 *   与 SubredditPage 相同模式：内容居中 + 为 fixed Navbar 垫高。
 *   max-w-[1320px] 对应原 content-container。
 *
 * ── 知识点：rounded-md vs rounded-xs ──
 *   原 Profile 卡片 border-radius: 8px → rounded-md（--radius-md: 8px）。
 *   Subreddit/Feed 多用 4px → rounded-xs。同一项目可并存，不必强行统一。
 *
 * ── 知识点：shadow-sm ──
 *   原 box-shadow: 0 2px 4px rgba(0,0,0,0.05) 近似 shadow-sm。
 *   文档：https://tailwindcss.com/docs/box-shadow
 *
 * ── 知识点：self-center ──
 *   在 flex-col 父级里让「加载更多」按钮水平居中（align-self: center）。
 *   文档：https://tailwindcss.com/docs/align-self
 */

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const publicUser = useQuery(
    api.users.getPublicUser,
    username ? { username } : "skip",
  );
  const {
    results: posts,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.posts.userPosts,
    username ? { authorUsername: username } : "skip",
    { initialNumItems: 20 },
  );

  if (!username) {
    return (
      <div className="mx-auto max-w-[1320px] px-5 pt-[69px] pb-5">
        <div className="rounded-md bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="m-0 text-2xl text-gray-900">未找到用户</h1>
        </div>
      </div>
    );
  }

  const postCount = publicUser?.posts ?? posts.length;

  return (
    <div className="mx-auto max-w-[1320px] px-5 pt-[69px] pb-5">
      <div className="mb-6 rounded-md border border-gray-300 bg-white p-6 shadow-sm">
        <h1 className="m-0 text-2xl font-semibold text-gray-900">
          u/{publicUser?.username ?? username}
        </h1>
        <div className="mt-2 text-[13px] font-semibold text-gray-500">
          <span>{postCount} 篇帖子</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="rounded-md border border-gray-300 bg-white p-6 text-center text-gray-500">
            <p className="m-0">还没有帖子</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} showSubreddit />
          ))
        )}
        {status === "CanLoadMore" && (
          <button
            type="button"
            className="self-center cursor-pointer rounded-full border-0 bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={() => loadMore(20)}
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
