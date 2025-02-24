import { prisma } from "@/lib/prisma";

export class ApiKeyService {
  static async validateAndUpdateUsage(apiKey: string) {
    const validKey = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        status: "active",
      },
    });

    if (!validKey) {
      throw new Error("API Key tidak ditemukan atau tidak aktif");
    }

    // Update usage count
    await prisma.apiKey.update({
      where: { id: validKey.id },
      data: { usage: { increment: 1 } },
    });

    return validKey;
  }
}
