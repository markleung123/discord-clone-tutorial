import {
  ChannelIdMissing,
  ConversationIdMissing,
  InternalError,
  Unauthorized,
} from "@/app/api/httpResponse";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGE_BATCH = 20;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return Unauthorized();
    }
    if (!conversationId) {
      return ConversationIdMissing();
    }

    let messages: DirectMessage[] = [];
    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH,
        skip: 1,
        cursor: { id: cursor },
        where: { conversationId },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH,
        where: { conversationId },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGE_BATCH) {
      nextCursor = messages[MESSAGE_BATCH - 1].id;
    }

    return NextResponse.json({ items: messages, nextCursor });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return InternalError();
  }
}