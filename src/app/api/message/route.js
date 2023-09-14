import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const roomId = request.nextUrl.searchParams.get("roomId");
  readDB();

  let filtered = DB.messages;

  if (roomId !== null) {
    filtered = filtered.filter((x) => x.roomId === roomId);
  }
  if (filtered.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: filtered,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  const { roomId, messageText } = body;

  readDB();

  const foundroomId = DB.rooms.find((x) => x.roomId === roomId);
  if (!foundroomId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();
  DB.messages.push({ roomId, messageId, messageText });

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId: messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();
  let role = payload.role;
  console.log(role);
  if (role !== "SUPER_ADMIN")
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );

  const body = await request.json();
  const { messageId } = body;
  const foundmessageId = DB.messages.find((x) => x.messageId === messageId);

  readDB();
  if (!foundmessageId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  const foundIndex = DB.messages.findIndex(
    (x) => x.messageId === body.messageId
  );
  DB.messages.splice(foundIndex, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
