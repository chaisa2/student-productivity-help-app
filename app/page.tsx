"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import FocusTimer from "@/components/focus-timer"
import TodoList from "@/components/todo-list"
import HabitTracker from "@/components/habit-tracker"
import Calendar from "@/components/calendar"
import Chatbot from "@/components/chatbot"

type ActiveTab = "timer" | "todos" | "habits" | "calendar" | "chatbot"

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("timer")

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "timer":
        return <FocusTimer />
      case "todos":
        return <TodoList />
      case "habits":
        return <HabitTracker />
      case "calendar":
        return <Calendar />
      case "chatbot":
        return <Chatbot />
      default:
        return <FocusTimer />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">StudyFlow</h1>
          <p className="text-muted-foreground">Your complete student productivity toolkit</p>
        </header>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="mt-8">{renderActiveComponent()}</main>
      </div>
    </div>
  )
}
