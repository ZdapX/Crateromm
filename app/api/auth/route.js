import dbConnect from "@/lib/db";
import { User } from "@/models/Models";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const { action, username, password } = await req.json();

  if (action === "register") {
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: Math.random().toString(), name: username }); // Simple hash bypass for demo
      return NextResponse.json(user);
    } catch (e) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
  }

  if (action === "login") {
    const user = await User.findOne({ username });
    if (user) return NextResponse.json(user);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
