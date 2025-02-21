import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateApiKeySchema = z.object({
  name: z.string().min(3, "Nama harus minimal 3 karakter"),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["dev", "prod"]),
  monthlyLimit: z.number().min(1, "Batasan bulanan harus lebih dari 0"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    });

    if (!apiKey) {
      return NextResponse.json(
        { message: "API Key tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: apiKey });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateApiKeySchema.parse(body);

    const apiKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ data: apiKey });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: error.errors },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.apiKey.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "API Key berhasil dihapus" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
