import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getGithubReadme } from "@/lib/github";

// Tipe untuk request body
type RequestBody = {
  githubUrl: string;
};

export async function POST(req: Request) {
  try {
    // Get API Key from header
    const apiKey = req.headers.get("x-api-key");
    console.log("Received API Key:", apiKey);

    const body = (await req.json()) as RequestBody;
    const githubUrl = body.githubUrl;
    console.log("Received GitHub URL:", githubUrl);

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
    console.log("Checking database connection..."); // Logging untuk debug

    // Validasi API Key
    const validKey = await prisma.apiKey
      .findFirst({
        where: {
          key: apiKey,
          status: "active",
        },
      })
      .catch((error) => {
        console.error("Database error:", error); // Logging untuk debug
        throw new Error(`Database connection error: ${error.message}`);
      });

    if (!validKey) {
      return NextResponse.json(
        {
          error: "Invalid API key",
          message: "API Key tidak ditemukan atau tidak aktif",
        },
        { status: 401 }
      );
    }

    // Update penggunaan API
    await prisma.apiKey.update({
      where: { id: validKey.id },
      data: { usage: { increment: 1 } },
    });

    // Fetch README content
    console.log("Fetching README content...");
    const readmeContent = await getGithubReadme(githubUrl);

    // Verifikasi OPENAI_API_KEY
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY tidak ditemukan dalam environment variables"
      );
    }

    // Implementasi GitHub summarization logic
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const template = `Analyze and summarize the following GitHub repository:
    URL: {githubUrl}

    Please provide:
    1. Brief overview of the project
    2. Main features and functionalities
    3. Technologies used
    4. Project structure analysis
    5. Key dependencies
    6. Best practices implemented

    Format the response in a clear, structured way.`;

    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(chat);

    const response = await chain.invoke({
      githubUrl: githubUrl,
    });

    return NextResponse.json(
      {
        data: {
          id: validKey.id,
          summary: response,
          readme: readmeContent,
        },
        message: "Repository berhasil dianalisis",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in GitHub summarizer:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Terjadi kesalahan saat menganalisis repository",
      },
      { status: 500 }
    );
  }
}
