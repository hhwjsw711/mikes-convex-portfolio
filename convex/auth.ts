import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple auth using environment variables
const ADMIN_EMAIL = "hhwjsw711@gmail.com";

// Login mutation - checks email and password
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("Admin password not configured");
    }

    if (email !== ADMIN_EMAIL) {
      throw new Error("Invalid credentials");
    }

    if (password !== adminPassword) {
      throw new Error("Invalid credentials");
    }

    // Create a simple session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      token: sessionToken,
      email,
      expiresAt,
    });

    return { token: sessionToken, email };
  },
});

// Verify session
export const verifySession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("token"), token))
      .first();

    if (!session) {
      return null;
    }

    // Check if expired (just return null, cleanup will happen in logout or login)
    if (session.expiresAt < Date.now()) {
      return null;
    }

    return { email: session.email };
  },
});

// Logout
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("token"), token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
