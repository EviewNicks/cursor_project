import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    const validKey = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        status: "active",
      },
    });

    if (!validKey) {
      return NextResponse.json(
        { message: "Invalid API Key." },
        { status: 401 }
      );
    }

    // Update usage count
    await prisma.apiKey.update({
      where: { id: validKey.id },
      data: { usage: validKey.usage + 1 },
    });

    return NextResponse.json(
      { message: "Valid API Key, halaman /protected dapat diakses." },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat validasi." },
      { status: 500 }
    );
  }
} 