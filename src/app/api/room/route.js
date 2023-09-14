import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: DB.rooms,
    totalRooms: DB.rooms.length,
  });
};

export const POST = async (request) => {
  const payload = checkToken();
  // let role = payload.role;
  // console.log(role);
  // role !== "ADMIN" && role != "SUPER_ADMIN"

  if (payload === null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { roomName } = body;

  readDB();
  const foundroomName = DB.rooms.find((x) => x.roomName === roomName);
  if (foundroomName) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room ${roomName} already exists`,
      },
      { status: 400 }
    );
  }

  const roomId = nanoid();
  DB.rooms.push({ roomId, roomName });

  //call writeDB after modifying Database
  writeDB();

  return NextResponse.json({
    ok: true,
    roomId: roomId,
    message: `Room ${roomName} has been created`,
  });
};
