import { NextResponse } from "next/server";
import { ApiKeyService } from "@/lib/services/api-key.service";
import { GithubAnalyzerService } from "@/lib/services/github-analyzer.service";

// Tipe untuk request body
type RequestBody = {
  githubUrl: string;
};

export async function POST(req: Request) {
  try {
    // Get API Key from header
    const apiKey = req.headers.get("x-api-key");
    const body = (await req.json()) as RequestBody;
    const { githubUrl } = body;

    // Validasi input
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing API key",
          message: "API Key harus dikirim melalui header 'x-api-key'",
        },
        { status: 400 }
      );
    }

    if (!githubUrl) {
      return NextResponse.json(
        {
          error: "Missing GitHub URL",
          message: "URL GitHub tidak ditemukan dalam request",
        },
        { status: 400 }
      );
    }

    // Validasi API Key dan update usage
    const validKey = await ApiKeyService.validateAndUpdateUsage(apiKey);

    // Analisis repository
    const analyzer = new GithubAnalyzerService();
    const { analysis } = await analyzer.analyzeRepository(githubUrl);

    return NextResponse.json(
      {
        data: {
          id: validKey.id,
          repository: {
            url: githubUrl,
            analysis,
          },
        },
        message: "Repository berhasil dianalisis",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in GitHub analyzer:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("API Key")) {
      return NextResponse.json(
        {
          error: error.message,
          message: "API Key tidak valid",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Terjadi kesalahan saat menganalisis repository",
      },
      { status: 500 }
    );
  }
}
