import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import "../styles/SubmitPage.css";

const SubmitPage = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  const navigate = useNavigate();
  const subreddit = useQuery(
    api.subreddit.get,
    subredditName ? { name: subredditName } : "skip",
  );
  const createPost = useMutation(api.posts.create);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError("Please enter a title.");
      return;
    }

    if (!subreddit) {
      setError("Subreddit is still loading or does not exist.");
      return;
    }

    setIsSubmitting(true);
    try {
      const postId = await createPost({
        title: trimmedTitle,
        body: trimmedBody || undefined,
        subredditId: subreddit._id,
      });
      navigate(`/post/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subreddit === undefined) {
    return (
      <div className="content-container">
        <div className="submit-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className="content-container">
        <div className="not-found">
          <h1>Subreddit not found</h1>
          <p>The subreddit r/{subredditName} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="submit-container">
        <h1>Create a post in r/{subreddit.name}</h1>
        <form className="submit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="submit-title"
            maxLength={300}
            disabled={isSubmitting}
          />
          <textarea
            placeholder="Text (optional)"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="submit-body"
            disabled={isSubmitting}
          />
          {error && <div className="submit-error">{error}</div>}
          <div className="submit-actions">
            <button
              type="button"
              onClick={() => navigate(`/r/${subreddit.name}`)}
              className="back-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;
