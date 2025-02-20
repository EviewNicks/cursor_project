import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema validasi untuk API key
const apiKeySchema = z.object({
  name: z.string().min(3, "Nama harus minimal 3 karakter"),
  key: z.string(),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["dev", "prod"]),
  monthlyLimit: z.number().min(1, "Batasan bulanan harus lebih dari 0"),
});

export async function GET() {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data API keys" },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = apiKeySchema.parse(body);

    const apiKey = await prisma.apiKey.create({
      data: {
        ...validatedData,
        usage: 0,
      },
    });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Gagal membuat API key" },
      { status: 500 }
    );
  }
}
