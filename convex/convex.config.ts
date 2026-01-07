import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

// Three aggregate instances for video stats
app.use(aggregate, { name: "videoViews" });
app.use(aggregate, { name: "videoLikes" });
app.use(aggregate, { name: "videoComments" });

export default app;
