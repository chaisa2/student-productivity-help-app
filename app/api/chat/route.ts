import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const geminiKey = process.env.GEMINI_API_KEY

    if (!geminiKey) {
      return NextResponse.json({
        message: "Please add your GEMINI_API_KEY to the .env.local file and restart the server.",
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI study assistant for students. You help with studying, productivity, time management, and academic success. Keep responses practical, encouraging, and concise.

Student question: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    return NextResponse.json({
      message: data.candidates[0].content.parts[0].text,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        message: "I'm sorry, I encountered an error. Please check your API key and try again.",
      },
      { status: 200 },
    )
  }
}
