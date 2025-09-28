"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Check } from "lucide-react"

interface HabitEntry {
  date: string // YYYY-MM-DD format
  completed: boolean
}

interface Habit {
  id: string
  name: string
  description?: string
  frequency: "daily" | "weekly"
  category: string
  color: string
  createdAt: Date
  entries: HabitEntry[]
}

const CATEGORIES = ["Health", "Learning", "Productivity", "Fitness", "Mindfulness", "Other"]
const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as const,
    category: "Health",
    color: "bg-blue-500",
  })
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, -1 = last week, etc.

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("studyflow-habits")
    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits).map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
      }))
      setHabits(parsedHabits)
    }
  }, [])

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem("studyflow-habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      description: newHabit.description.trim() || undefined,
      frequency: newHabit.frequency,
      category: newHabit.category,
      color: newHabit.color,
      createdAt: new Date(),
      entries: [],
    }

    setHabits((prev) => [habit, ...prev])
    setNewHabit({
      name: "",
      description: "",
      frequency: "daily",
      category: "Health",
      color: "bg-blue-500",
    })
    setShowAddForm(false)
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  const toggleHabitEntry = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit

        const existingEntryIndex = habit.entries.findIndex((entry) => entry.date === date)

        if (existingEntryIndex >= 0) {
          // Toggle existing entry
          const updatedEntries = [...habit.entries]
          updatedEntries[existingEntryIndex].completed = !updatedEntries[existingEntryIndex].completed
          return { ...habit, entries: updatedEntries }
        } else {
          // Add new entry
          return {
            ...habit,
            entries: [...habit.entries, { date, completed: true }],
          }
        }
      }),
    )
  }

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7)

    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getHabitEntryForDate = (habit: Habit, date: string) => {
    return habit.entries.find((entry) => entry.date === date)
  }

  const calculateStreak = (habit: Habit) => {
    const today = getDateString(new Date())
    const sortedEntries = habit.entries
      .filter((entry) => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedEntries.length === 0) return 0

    let streak = 0
    const currentDate = new Date()

    // Check if today is completed, if not start from yesterday
    const todayEntry = habit.entries.find((entry) => entry.date === today && entry.completed)
    if (!todayEntry) {
      currentDate.setDate(currentDate.getDate() - 1)
    }

    while (true) {
      const dateString = getDateString(currentDate)
      const entry = habit.entries.find((e) => e.date === dateString && e.completed)

      if (entry) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const getCompletionRate = (habit: Habit, days = 30) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    let totalDays = 0
    let completedDays = 0

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = getDateString(d)
      totalDays++

      const entry = habit.entries.find((e) => e.date === dateString && e.completed)
      if (entry) {
        completedDays++
      }
    }

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  const weekDates = getWeekDates(selectedWeek)
  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{habits.length}</div>
            <div className="text-sm text-muted-foreground">Active Habits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {habits.reduce((sum, habit) => sum + calculateStreak(habit), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Streaks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">
              {habits.length > 0
                ? Math.round(habits.reduce((sum, habit) => sum + getCompletionRate(habit, 7), 0) / habits.length)
                : 0}
              %
            </div>
            <div className="text-sm text-muted-foreground">Weekly Average</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">
              {habits.reduce((sum, habit) => sum + habit.entries.filter((e) => e.completed).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Completions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Add Habit Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Habit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="habit-name">Habit Name</Label>
                    <Input
                      id="habit-name"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Read 20 pages"
                    />
                  </div>

                  <div>
                    <Label htmlFor="habit-description">Description</Label>
                    <Textarea
                      id="habit-description"
                      value={newHabit.description}
                      onChange={(e) => setNewHabit((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="habit-category">Category</Label>
                    <Select
                      value={newHabit.category}
                      onValueChange={(value) => setNewHabit((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="habit-frequency">Frequency</Label>
                    <Select
                      value={newHabit.frequency}
                      onValueChange={(value: any) => setNewHabit((prev) => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewHabit((prev) => ({ ...prev, color }))}
                          className={`w-6 h-6 rounded-full ${color} ${
                            newHabit.color === color ? "ring-2 ring-foreground ring-offset-2" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={addHabit} size="sm" className="flex-1">
                      Add
                    </Button>
                    <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Habit Tracker Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Habit Tracker</CardTitle>
                  <CardDescription>Track your daily and weekly habits</CardDescription>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedWeek(selectedWeek - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    {selectedWeek === 0
                      ? "This Week"
                      : `${Math.abs(selectedWeek)} week${Math.abs(selectedWeek) > 1 ? "s" : ""} ${selectedWeek < 0 ? "ago" : "ahead"}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(selectedWeek + 1)}
                    disabled={selectedWeek >= 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No habits yet. Add your first habit to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-medium text-sm text-muted-foreground">Habit</div>
                    {weekDates.map((date, index) => (
                      <div key={date.toISOString()} className="text-center">
                        <div className="text-xs text-muted-foreground">{weekDayNames[index]}</div>
                        <div className="text-sm font-medium">{date.getDate()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Habit Rows */}
                  {habits.map((habit) => (
                    <div key={habit.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-8 gap-2 items-center">
                        {/* Habit Info */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                            <h3 className="font-medium text-sm">{habit.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {habit.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{calculateStreak(habit)} day streak</span>
                          </div>
                        </div>

                        {/* Daily Checkboxes */}
                        {weekDates.map((date) => {
                          const dateString = getDateString(date)
                          const entry = getHabitEntryForDate(habit, dateString)
                          const isCompleted = entry?.completed || false
                          const isToday = dateString === getDateString(new Date())
                          const isFuture = date > new Date()

                          return (
                            <div key={dateString} className="flex justify-center">
                              <button
                                onClick={() => !isFuture && toggleHabitEntry(habit.id, dateString)}
                                disabled={isFuture}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? `${habit.color} border-transparent text-white`
                                    : isToday
                                      ? "border-primary hover:bg-primary/10"
                                      : isFuture
                                        ? "border-muted text-muted-foreground cursor-not-allowed"
                                        : "border-muted-foreground hover:border-primary hover:bg-primary/10"
                                }`}
                              >
                                {isCompleted && <Check className="w-4 h-4" />}
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {/* Habit Actions */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          {habit.description && <span>{habit.description} • </span>}
                          {getCompletionRate(habit, 30)}% completion rate (30 days)
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabit(habit.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
