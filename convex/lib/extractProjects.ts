"use node";

import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedProject {
  name: string;
  description: string;
  sourceUrl?: string;
  demoUrl?: string;
}

const EXTRACTION_PROMPT = `You are analyzing content from a developer's video or article to extract information about any projects mentioned.

Analyze the following content and extract project information. Look for:
1. GitHub/GitLab/Bitbucket repository URLs - these are source code links
2. Demo/live site URLs (Vercel, Netlify, custom domains, etc.)
3. The main project name being discussed
4. A brief description of what the project does

Rules:
- Only extract projects that are clearly the MAIN focus of the content, not just referenced libraries or tools
- If no clear project is mentioned, return an empty array
- Source URLs should be repository links (github.com, gitlab.com, bitbucket.org)
- Demo URLs should be live deployable sites, NOT source repos
- Keep descriptions concise (1-2 sentences max)

Return your response as a JSON array of projects. Each project should have:
- name: string (required)
- description: string (required, brief)
- sourceUrl: string or null (GitHub/GitLab/Bitbucket repo URL)
- demoUrl: string or null (live demo URL, not a source repo)

Example response:
[{"name": "EffectSim", "description": "A Convex-powered control and simulation app for Christmas light shows", "sourceUrl": "https://github.com/mikecann/effect-sim", "demoUrl": null}]

If no projects are found, return: []

Content to analyze:
`;

/**
 * Extract project information from text using Claude
 */
export async function extractProjectsWithLLM(
  text: string,
  title?: string
): Promise<ExtractedProject[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log("ANTHROPIC_API_KEY not configured, falling back to regex extraction");
    return [];
  }

  // Truncate very long text to avoid token limits
  const maxLength = 8000;
  const truncatedText = text.length > maxLength
    ? text.slice(0, maxLength) + "...[truncated]"
    : text;

  const contentToAnalyze = title
    ? `Title: ${title}\n\n${truncatedText}`
    : truncatedText;

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + contentToAnalyze,
        },
      ],
    });

    // Extract the text content from the response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      console.log("No text response from Claude");
      return [];
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("Could not find JSON array in response:", textContent.text);
      return [];
    }

    const projects: ExtractedProject[] = JSON.parse(jsonMatch[0]);

    // Validate and clean the results
    return projects
      .filter((p) => p.name && p.description)
      .map((p) => ({
        name: p.name,
        description: p.description.slice(0, 200), // Limit description length
        sourceUrl: p.sourceUrl || undefined,
        demoUrl: p.demoUrl || undefined,
      }));
  } catch (error) {
    console.error("Error extracting projects with LLM:", error);
    return [];
  }
}
