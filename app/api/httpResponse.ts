import { NextResponse } from "next/server";

export function Unauthorized() {
  return new NextResponse("Unauthorized", { status: 401 });
}

export function InternalError() {
  return new NextResponse("InternalError", { status: 500 });
}

export function MemberIdMissing() {
  return new NextResponse("Member ID missing", { status: 400 });
}

export function ServerIdMissing() {
  return new NextResponse("Server ID missing", { status: 400 });
}

export function NameCannotBeGeneral() {
  return new NextResponse("Name cannot be 'general'", { status: 400 });
}

export function ChannelIdMissing() {
  return new NextResponse("Channel ID missing", { status: 400 });
}

export function ConversationIdMissing() {
  return new NextResponse("Conversation ID missing", { status: 400 });
}
