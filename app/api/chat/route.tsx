import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "HUGGINGFACE_API_KEY is not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: buildPrompt(message, history),
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Hugging Face API error:", errorText)
      return NextResponse.json({ error: `Hugging Face API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const text = data[0]?.generated_text || "I apologize, but I couldn't generate a response."

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
