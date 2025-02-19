import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(apiKeys);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching API keys" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = await prisma.apiKey.create({
      data: body,
    });
    return NextResponse.json(apiKey);
  } catch (error) {
    return NextResponse.json({ error: "Error creating API key" }, { status: 500 });
  }
} 