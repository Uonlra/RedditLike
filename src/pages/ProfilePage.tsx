import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import "../styles/ProfilePage.css";

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
      <div className="content-container">
        <div className="not-found">
          <h1>User not found</h1>
        </div>
      </div>
    );
  }

  const postCount = publicUser?.posts ?? posts.length;

  return (
    <div className="content-container">
      <div className="profile-header">
        <h1>u/{publicUser?.username ?? username}</h1>
        <div className="profile-stats">
          <span>{postCount} {postCount === 1 ? "post" : "posts"}</span>
        </div>
      </div>
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} showSubreddit />
          ))
        )}
        {status === "CanLoadMore" && (
          <button className="load-more" onClick={() => loadMore(20)}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
