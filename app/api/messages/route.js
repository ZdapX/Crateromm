import dbConnect from "@/lib/db";
import { Message } from "@/models/Models";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");
  const senderId = searchParams.get("senderId");

  let query = { receiverId: null }; // Default Public
  if (receiverId && receiverId !== "null") {
    query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
  }

  const messages = await Message.find(query).sort({ createdAt: 1 }).limit(50);
  return NextResponse.json(messages);
}

export async function POST(req) {
  await dbConnect();
  const data = await req.json();
  const msg = await Message.create(data);
  return NextResponse.json(msg);
}
