import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";
import resend from "@convex-dev/resend/convex.config";

const app = defineApp();

// Three aggregate instances for video stats
app.use(aggregate, { name: "videoViews" });
app.use(aggregate, { name: "videoLikes" });
app.use(aggregate, { name: "videoComments" });

// Resend for email notifications
app.use(resend);

export default app;
