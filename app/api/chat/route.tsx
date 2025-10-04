import { type NextRequest, NextResponse } from "next/server"
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    const apiKey = process.env["GITHUB_TOKEN"];

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    // const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     inputs: buildPrompt(message, history),
    //     parameters: {
    //       max_new_tokens: 500,
    //       temperature: 0.7,
    //       top_p: 0.95,
    //       return_full_text: false,
    //     },
    //   }),
    // })

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(apiKey),
    );

    const response = await client.path("/chat/completions").post({
  body: {
    messages: [
      {
        role: "system",
        content: `You are a supportive AI assistant within a student productivity and well-being web app that includes a focus timer, calendar, habit tracker, and to-do list. 
Your role is to motivate, guide, and explain clearly (Feynman style) to help students study effectively and maintain mental balance. 
Keep a friendly, encouraging tone. Give concise, actionable advice. 
Suggest relevant tools (e.g., “add to your calendar,” “set a timer,” “track this habit”) when appropriate. 
Offer gentle wellness reminders, but do not provide medical diagnoses.`
      },
      { role: "user", content: buildPrompt(message, history) }
    ],
    model: model
  }
});

    // if (!response.ok) {
    //   const errorText = await response.text()
    //   console.error("[v0] Hugging Face API error:", errorText)
    //   return NextResponse.json({ error: `Hugging Face API error: ${response.status}` }, { status: response.status })
    // }

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const data = response.body;
    const text = data?.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response."

    return NextResponse.json({ message: text })
  } catch (error: any) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: `Failed to get response: ${error.message || "Unknown error"}` }, { status: 500 })
  }
}

function buildPrompt(message: string, history?: Array<{ role: string; content: string }>) {
  let prompt = "<s>"

  // Add conversation history
  if (history && history.length > 0) {
    for (const msg of history) {
      if (msg.role === "user") {
        prompt += `[INST] ${msg.content} [/INST]`
      } else {
        prompt += ` ${msg.content}</s>`
      }
    }
  }

  // Add system context for student productivity
  const systemContext =
    "You are a helpful AI assistant focused on student productivity, study tips, time management, and academic success. Provide practical, actionable advice."

  // Add current message
  prompt += `[INST] ${systemContext}\n\n${message} [/INST]`

  return prompt
}
