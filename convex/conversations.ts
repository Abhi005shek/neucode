import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

import { verifyAuth } from "./auth";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
  },
  async handler(ctx, args) {
    const identity = await verifyAuth(ctx);
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthroized to access this project");
    }

    const conversationId = await ctx.db.insert("conversations", {
      projectId: args.projectId,
      title: args.title,
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

export const getById = query({
  args: {
    id: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await verifyAuth(ctx);

    const conversation = await ctx.db.get("conversations", args.id);
    if (!conversation) {
      throw new Error("No conversation found");
    }
    const project = await ctx.db.get("projects", conversation?.projectId);

    if (!project) {
      throw new Error("No project found");
    }

    if (project?.ownerId !== identity.subject) {
      throw new Error("You are not authorized!!");
    }

    return conversation;
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, args) {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.projectId);

    if (!project) {
      throw new Error("No project found");
    }

    if (project?.ownerId !== identity.subject) {
      throw new Error("You are not authorized!!");
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await verifyAuth(ctx);

    const conversation = await ctx.db.get("conversations", args.conversationId);

    if (!conversation) {
      throw new Error("No conversation found");
    }

    const project = await ctx.db.get("projects", conversation.projectId);

    if (!project) throw new Error("No project found");

    if (project?.ownerId !== identity.subject) {
      throw new Error("You are not authorized!!");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();
  },
});
