import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { apiKey } = await req.json();

  try {
    const validKey = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        status: "active",
      },
    });

    if (validKey) {
      // Update usage count
      await prisma.apiKey.update({
        where: { id: validKey.id },
        data: { usage: { increment: 1 } },
      });

      return NextResponse.json(
        {
          data: { id: validKey.id },
          message: "Valid API Key",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "Invalid API key",
        message: "API Key tidak ditemukan atau tidak aktif",
      },
      { status: 401 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Terjadi kesalahan saat validasi API Key",
      },
      { status: 500 }
    );
  }
}
