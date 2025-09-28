"use client"

interface NavigationProps {
  activeTab: "timer" | "todos" | "habits" | "calendar" | "chatbot"
  onTabChange: (tab: "timer" | "todos" | "habits" | "calendar" | "chatbot") => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "timer" as const, label: "Focus Timer", icon: "⏱️" },
    { id: "todos" as const, label: "To-Do List", icon: "✅" },
    { id: "habits" as const, label: "Habits", icon: "🎯" },
    { id: "calendar" as const, label: "Calendar", icon: "📅" },
    { id: "chatbot" as const, label: "AI Assistant", icon: "🤖" },
  ]

  return (
    <nav className="border-b border-border">
      <div className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
