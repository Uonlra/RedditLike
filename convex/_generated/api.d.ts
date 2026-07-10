/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authConstants from "../authConstants.js";
import type * as comments from "../comments.js";
import type * as counter from "../counter.js";
import type * as http from "../http.js";
import type * as image from "../image.js";
import type * as leaderboard from "../leaderboard.js";
import type * as messages from "../messages.js";
import type * as posts from "../posts.js";
import type * as subreddit from "../subreddit.js";
import type * as users from "../users.js";
import type * as vote from "../vote.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authConstants: typeof authConstants;
  comments: typeof comments;
  counter: typeof counter;
  http: typeof http;
  image: typeof image;
  leaderboard: typeof leaderboard;
  messages: typeof messages;
  posts: typeof posts;
  subreddit: typeof subreddit;
  users: typeof users;
  vote: typeof vote;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  shardedCounter: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"shardedCounter">;
};
