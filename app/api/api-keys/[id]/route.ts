import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateApiKeySchema = z.object({
  name: z.string().min(3, "Nama harus minimal 3 karakter"),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["dev", "prod"]),
  monthlyLimit: z.number().min(1, "Batasan bulanan harus lebih dari 0"),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateApiKeySchema.parse(body);

    // Cek apakah API key exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek nama duplikat jika nama diubah
    if (body.name !== existingKey.name) {
      const duplicateName = await prisma.apiKey.findFirst({
        where: { name: body.name },
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: "Nama API key sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Update API key
    const apiKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error updating API key:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah API key exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus API key
    await prisma.apiKey.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "API key berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Gagal menghapus API key" },
      { status: 500 }
    );
  }
}
