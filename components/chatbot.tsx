"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Trash2, RefreshCw } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  lastUpdated: Date
}

export default function Chatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("studyflow-chat-sessions")
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastUpdated: new Date(session.lastUpdated),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      setSessions(parsedSessions)

      // Set the most recent session as current
      if (parsedSessions.length > 0) {
        const mostRecent = parsedSessions.sort(
          (a: ChatSession, b: ChatSession) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
        )[0]
        setCurrentSessionId(mostRecent.id)
      }
    }
  }, [])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem("studyflow-chat-sessions", JSON.stringify(sessions))
  }, [sessions])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, currentSessionId])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))

    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter((session) => session.id !== sessionId)
      setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null)
    }
  }

  const getCurrentSession = () => {
    return sessions.find((session) => session.id === currentSessionId)
  }

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage
    setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, title } : session)))
  }

  const addMessage = (content: string, role: "user" | "assistant") => {
    if (!currentSessionId) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    }

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          const updatedMessages = [...session.messages, newMessage]

          // Update session title with first user message
          let updatedTitle = session.title
          if (role === "user" && session.messages.length === 0) {
            updatedTitle = content.length > 30 ? content.substring(0, 30) + "..." : content
          }

          return {
            ...session,
            messages: updatedMessages,
            title: updatedTitle,
            lastUpdated: new Date(),
          }
        }
        return session
      }),
    )
  }

  const simulateAIResponse = async (userMessage: string) => {
    const currentSession = getCurrentSession()
    const history =
      currentSession?.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || []

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        history: history,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get AI response")
    }

    return data.message
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Create new session if none exists
    if (!currentSessionId) {
      createNewSession()
      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    // Add user message
    addMessage(userMessage, "user")

    try {
      const aiResponse = await simulateAIResponse(userMessage)
      addMessage(aiResponse, "assistant")
    } catch (error) {
      console.error("Error getting AI response:", error)
      // Simplified error message without API key instructions
      addMessage("I'm sorry, I encountered an error. Please try again.", "assistant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const currentSession = getCurrentSession()

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Chat Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Chat Sessions</CardTitle>
                <Button onClick={createNewSession} size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Your conversation history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="p-4 space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No chat sessions yet. Start a conversation!
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentSessionId === session.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => setCurrentSessionId(session.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{session.title}</h4>
                            <p className="text-xs opacity-70 mt-1">{session.messages.length} messages</p>
                            <p className="text-xs opacity-70">{session.lastUpdated.toLocaleDateString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                            }}
                            className="opacity-70 hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>AI Study Assistant</span>
              </CardTitle>
              <CardDescription>
                Your personal AI assistant for studying and productivity
                {currentSession && <span className="block mt-1 text-xs">Session: {currentSession.title}</span>}
              </CardDescription>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                {!currentSession || currentSession.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <Bot className="w-16 h-16 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Welcome to your AI Study Assistant!</h3>
                      <p className="text-muted-foreground mt-2">
                        Ask me anything about studying, productivity, or academic topics.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                        </div>

                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-secondary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about studying or productivity..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
