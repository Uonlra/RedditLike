import { useQuery } from "convex/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import PostCard from "../components/PostCard";

/**
 * PostPage — 单帖详情页。
 *
 * ── 知识点：加载态用 flex 居中 ──
 *   flex min-h-[240px] items-center justify-center
 *   等价于原 .post-page.loading 的垂直+水平居中。
 *
 * ── 知识点：返回按钮重置默认 button 样式 ──
 *   index.css 全局 button 有 border/background/min-height。
 *   这里用 border-0 bg-transparent p-0 覆盖，做成「文字链接」外观。
 *   这是全局 base 样式与工具类冲突时的标准解法（utilities 压 base）。
 *
 * ── 知识点：navigate(-1) ──
 *   浏览器历史回退，与 Tailwind 无关，但是详情页常见交互。
 */

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const post = useQuery(
    api.posts.getPost,
    postId ? { id: postId as Id<"posts"> } : "skip",
  );

  if (post === undefined) {
    return (
      <div className="flex min-h-[240px] items-center justify-center pt-[69px] text-lg text-gray-900">
        加载中...
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="flex min-h-[240px] items-center justify-center pt-[69px] text-lg text-gray-900">
        未找到帖子。
      </div>
    );
  }

  return (
    <div className="pt-[69px]">
      <div className="mx-auto max-w-[1320px] px-5">
        <div className="mb-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 font-inherit text-gray-900 hover:text-gray-500"
          >
            <FaArrowLeft /> 返回
          </button>
        </div>
        <PostCard post={post} showSubreddit expandedView />
      </div>
    </div>
  );
};

export default PostPage;
