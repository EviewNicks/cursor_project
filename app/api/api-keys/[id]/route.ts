import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const apiKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(apiKey);
  } catch (error) {
    return NextResponse.json({ error: "Error updating API key" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.apiKey.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting API key" }, { status: 500 });
  }
} 