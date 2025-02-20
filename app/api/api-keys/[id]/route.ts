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
  const id = await Promise.resolve(params.id);

  try {
    const body = await request.json();
    const validatedData = updateApiKeySchema.parse(body);

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error updating API key:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: error.errors,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui API key" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id);

  try {
    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ message: "API key berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Gagal menghapus API key" },
      {
        status: 500,
      }
    );
  }
}
