import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const geminiKey = process.env.GEMINI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (geminiKey) {
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
    } else if (openaiKey) {
      // OpenAI API call
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI study assistant for students. Provide practical advice on studying, productivity, time management, and academic success. Keep responses concise but helpful.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        message: data.choices[0].message.content,
      })
    } else {
      return NextResponse.json({
        message:
          "🔧 **Setup Required**: No AI API key found. Please add `GEMINI_API_KEY` to your environment variables.\\n\\n**Steps:**\\n1. Go to Google Cloud Console\\n2. Enable Generative Language API\\n3. Create an API key\\n4. Add `GEMINI_API_KEY=your_key` to environment variables\\n5. Restart the server",
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        message:
          "I'm sorry, I encountered an error. Please check your API key and try again. Make sure you've enabled the Generative Language API in Google Cloud Console.",
      },
      { status: 200 },
    )
  }
}
