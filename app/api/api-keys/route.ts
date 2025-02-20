import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Redis } from "@upstash/redis";
import { kv } from "@vercel/kv";

// Schema validasi untuk API key
const apiKeySchema = z.object({
  name: z.string().min(3, "Nama harus minimal 3 karakter"),
  key: z.string(),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["dev", "prod"]),
  monthlyLimit: z.number().min(1, "Batasan bulanan harus lebih dari 0"),
});

// Schema validasi untuk query parameters
const querySchema = z.object({
  page: z.string().optional().transform(Number).default("1"),
  limit: z.string().optional().transform(Number).default("10"),
  search: z.string().optional(),
});

// Cache key
const CACHE_KEY = "api-keys-list";
const CACHE_TTL = 60; // 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = querySchema.parse(Object.fromEntries(searchParams));

    // Generate cache key berdasarkan parameter
    const cacheKey = `${CACHE_KEY}:${page}:${limit}:${search || ""}`;

    // Coba ambil dari cache
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Build query
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { key: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Get total count untuk pagination
    const total = await prisma.apiKey.count({ where });

    // Get data dengan pagination
    const apiKeys = await prisma.apiKey.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        key: true,
        status: true,
        type: true,
        usage: true,
        monthlyLimit: true,
        createdAt: true,
      },
    });

    const result = {
      data: apiKeys,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Simpan ke cache
    await kv.set(cacheKey, result, {
      ex: CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = apiKeySchema.parse(body);

    // Gunakan transaction untuk memastikan konsistensi data
    const apiKey = await prisma.$transaction(async (tx) => {
      // Cek nama duplikat dalam transaction
      const existingKey = await tx.apiKey.findFirst({
        where: { name: validatedData.name },
      });

      if (existingKey) {
        throw new Error("DUPLICATE_NAME");
      }

      return tx.apiKey.create({
        data: {
          ...validatedData,
          usage: 0,
        },
      });
    });

    // Invalidate cache setelah create
    const cachePattern = `${CACHE_KEY}:*`;
    await kv.del(cachePattern);

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error("Error creating API key:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "DUPLICATE_NAME") {
      return NextResponse.json(
        { error: "Nama API key sudah digunakan" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat API key" },
      { status: 500 }
    );
  }
}
