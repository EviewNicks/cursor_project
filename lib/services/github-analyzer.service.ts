import { z } from "zod";
import { getGithubReadme } from "@/lib/github";

// Schema untuk output
export const GithubAnalysisSchema = z.object({
  summary: z.string(),
  cool_facts: z.array(z.string()),
});

export type GithubAnalysisResult = z.infer<typeof GithubAnalysisSchema>;

// Custom output parser untuk format teks README
const parseReadmeContent = (content: string): GithubAnalysisResult => {
  // Ekstrak judul utama
  const titleMatch = content.match(/# (.*)/);
  const title = titleMatch ? titleMatch[1] : "";

  // Ekstrak poin-poin penting (mencari list dengan * atau -)
  const bulletPoints = content.match(/[*-] (.*)/g) || [];
  const facts = bulletPoints
    .map((point) => point.replace(/[*-] /, "").trim())
    .filter((fact) => fact.length > 0)
    .slice(0, 5); // Ambil 5 fakta pertama

  // Ekstrak paragraf pertama untuk summary
  const paragraphs = content.split("\n\n");
  const firstParagraph =
    paragraphs.find(
      (p) => p.trim() && !p.includes("#") && !p.includes("```")
    ) || "";

  return GithubAnalysisSchema.parse({
    summary: firstParagraph.trim() || title,
    cool_facts: facts,
  });
};

export class GithubAnalyzerService {
  async analyzeRepository(githubUrl: string): Promise<{
    readme: string;
    analysis: GithubAnalysisResult;
  }> {
    const readme = await getGithubReadme(githubUrl);
    const analysis = parseReadmeContent(readme);

    return {
      readme,
      analysis,
    };
  }
}
