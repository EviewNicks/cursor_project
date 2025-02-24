import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { getGithubReadme } from "@/lib/github";

// Schema untuk output
export const GithubAnalysisSchema = z.object({
  summary: z.string(),
  cool_facts: z.array(z.string()),
});

export type GithubAnalysisResult = z.infer<typeof GithubAnalysisSchema>;

// Custom output parser
const createCustomOutputParser = () => ({
  parse: (text: string) => {
    const summaryMatch = text.match(/SUMMARY:(.*?)(?=COOL_FACTS:|$)/s);
    const coolFactsMatch = text.match(/COOL_FACTS:(.*?)$/s);

    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    const coolFacts = coolFactsMatch
      ? coolFactsMatch[1]
          .split("|")
          .map((fact) => fact.trim())
          .filter((fact) => fact.length > 0)
      : [];

    return GithubAnalysisSchema.parse({
      summary,
      cool_facts: coolFacts,
    });
  },
});

// Prompt template
const ANALYSIS_PROMPT = `
  Kamu adalah seorang expert dalam menganalisis repository GitHub.
  Tolong analisis README file berikut dan berikan ringkasan serta fakta menarik.
  
  README Content:
  {readme}
  
  Berikan output dalam format berikut:
  SUMMARY: <ringkasan singkat dan jelas tentang repository>
  COOL_FACTS: <daftar fakta menarik dipisahkan dengan |>
`;

export class GithubAnalyzerService {
  private chain: RunnableSequence;

  constructor() {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const promptTemplate = PromptTemplate.fromTemplate(ANALYSIS_PROMPT);

    this.chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser(),
      createCustomOutputParser(),
    ]);
  }

  async analyzeRepository(githubUrl: string): Promise<{
    readme: string;
    analysis: GithubAnalysisResult;
  }> {
    const readme = await getGithubReadme(githubUrl);
    const analysis = await this.chain.invoke({ readme });

    return {
      readme,
      analysis,
    };
  }
}
