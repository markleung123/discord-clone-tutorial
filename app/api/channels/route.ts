import {
  InternalError,
  NameCannotBeGeneral,
  ServerIdMissing,
  Unauthorized,
} from "@/app/api/httpResponse";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return Unauthorized();
    }
    if (!serverId) {
      return ServerIdMissing();
    }
    if (name === "general") {
      return NameCannotBeGeneral();
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        channels: {
          create: { profileId: profile.id, name, type },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return InternalError();
  }
}
