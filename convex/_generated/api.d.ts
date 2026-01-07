/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as articles from "../articles.js";
import type * as crons from "../crons.js";
import type * as model_articles from "../model/articles.js";
import type * as model_projects from "../model/projects.js";
import type * as model_videos from "../model/videos.js";
import type * as projects from "../projects.js";
import type * as stack from "../stack.js";
import type * as videos from "../videos.js";
import type * as youtube from "../youtube.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  articles: typeof articles;
  crons: typeof crons;
  "model/articles": typeof model_articles;
  "model/projects": typeof model_projects;
  "model/videos": typeof model_videos;
  projects: typeof projects;
  stack: typeof stack;
  videos: typeof videos;
  youtube: typeof youtube;
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

export declare const components: {};
