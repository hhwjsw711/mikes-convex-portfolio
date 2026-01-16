"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const resend = new Resend(components.resend, {});

const ADMIN_EMAIL = "mike.cann@gmail.com";
const FROM_EMAIL = "Portfolio Notifications <onboarding@resend.dev>";

interface VideoForNotification {
  _id: Id<"videos">;
  title: string;
  thumbnailUrl: string;
  youtubeId: string;
  publishedAt: string;
}

export const sendModerationNotification = internalAction({
  args: {
    newVideoIds: v.array(v.id("videos")),
  },
  handler: async (ctx, { newVideoIds }) => {
    if (newVideoIds.length === 0) {
      return { sent: false, reason: "No new videos" };
    }

    const videos: VideoForNotification[] = [];
    for (const videoId of newVideoIds) {
      const video = await ctx.runQuery(internal.videos.getById, {
        id: videoId,
      });
      if (video) {
        videos.push(video);
      }
    }

    if (videos.length === 0) {
      return { sent: false, reason: "No videos found" };
    }

    const html = generateModerationEmailHtml(videos);

    try {
      await resend.sendEmail(ctx, {
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `${videos.length} New YouTube Video${videos.length > 1 ? "s" : ""} Need Moderation`,
        html,
      });

      console.log(`Moderation email sent for ${videos.length} new videos`);
      return { sent: true, videoCount: videos.length };
    } catch (error) {
      console.error("Failed to send moderation email:", error);
      return {
        sent: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

function generateModerationEmailHtml(videos: VideoForNotification[]): string {
  const adminUrl = process.env.SITE_URL
    ? `${process.env.SITE_URL}/admin`
    : "https://your-site.com/admin";

  const videoItems = videos
    .map(
      (video) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #333;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="120" style="vertical-align: top;">
                <a href="https://www.youtube.com/watch?v=${video.youtubeId}">
                  <img
                    src="${video.thumbnailUrl}"
                    alt="${escapeHtml(video.title)}"
                    width="120"
                    style="border-radius: 4px; display: block;"
                  />
                </a>
              </td>
              <td style="vertical-align: top; padding-left: 16px;">
                <a
                  href="https://www.youtube.com/watch?v=${video.youtubeId}"
                  style="color: #f97316; text-decoration: none; font-weight: 600; font-size: 14px;"
                >
                  ${escapeHtml(video.title)}
                </a>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  Published: ${new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0a0a;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
              <!-- Header -->
              <tr>
                <td style="background-color: #111111; padding: 24px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #333;">
                  <h1 style="margin: 0; color: #f97316; font-size: 24px; font-weight: 700;">
                    New Videos Need Moderation
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">
                    ${videos.length} new video${videos.length > 1 ? "s have" : " has"} been fetched and ${videos.length > 1 ? "need" : "needs"} your review.
                  </p>
                </td>
              </tr>

              <!-- Video List -->
              <tr>
                <td style="background-color: #111111;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${videoItems}
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="background-color: #111111; padding: 24px; border-radius: 0 0 8px 8px; text-align: center;">
                  <a
                    href="${adminUrl}"
                    style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;"
                  >
                    Review in Admin Panel
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    This is an automated notification from your portfolio site.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
