"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, Clock } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  time?: string // HH:MM format
  duration?: number // minutes
  category: string
  color: string
  createdAt: Date
}

const CATEGORIES = ["Study", "Assignment", "Exam", "Meeting", "Personal", "Other"]
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    category: "Study",
    color: "bg-blue-500",
  })
  const [view, setView] = useState<"month" | "week">("month")

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("studyflow-events")
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        createdAt: new Date(event.createdAt),
      }))
      setEvents(parsedEvents)
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("studyflow-events", JSON.stringify(events))
  }, [events])

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      date: newEvent.date,
      time: newEvent.time || undefined,
      duration: newEvent.duration,
      category: newEvent.category,
      color: newEvent.color,
      createdAt: new Date(),
    }

    setEvents((prev) => [...prev, event])
    resetForm()
    setShowEventDialog(false)
  }

  const updateEvent = () => {
    if (!editingEvent || !newEvent.title.trim() || !newEvent.date) return

    setEvents((prev) =>
      prev.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: newEvent.title.trim(),
              description: newEvent.description.trim() || undefined,
              date: newEvent.date,
              time: newEvent.time || undefined,
              duration: newEvent.duration,
              category: newEvent.category,
              color: newEvent.color,
            }
          : event,
      ),
    )
    resetForm()
    setEditingEvent(null)
    setShowEventDialog(false)
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      date: selectedDate || "",
      time: "",
      duration: 60,
      category: "Study",
      color: "bg-blue-500",
    })
  }

  const openEventDialog = (date?: string) => {
    resetForm()
    if (date) {
      setNewEvent((prev) => ({ ...prev, date }))
      setSelectedDate(date)
    }
    setShowEventDialog(true)
  }

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description || "",
      date: event.date,
      time: event.time || "",
      duration: event.duration || 60,
      category: event.category,
      color: event.color,
    })
    setShowEventDialog(true)
  }

  const getMonthData = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return { days, firstDay, lastDay }
  }

  const getWeekData = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(date.getDate() - day)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return newDate
    })
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
      return newDate
    })
  }

  const { days: monthDays } = getMonthData(currentDate)
  const weekDays = getWeekData(currentDate)
  const displayDays = view === "month" ? monthDays : weekDays

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <CardDescription>Manage your schedule and events</CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("month")}
                  className="rounded-r-none"
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("week")}
                  className="rounded-l-none"
                >
                  Week
                </Button>
              </div>

              {/* Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "month" ? navigateMonth("next") : navigateWeek("next"))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button onClick={() => openEventDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {/* Weekday Headers */}
          <div className={`grid ${view === "month" ? "grid-cols-7" : "grid-cols-7"} gap-2 mb-4`}>
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={`grid ${view === "month" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
            {displayDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonthDay = view === "week" || isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    isTodayDate
                      ? "bg-primary/10 border-primary"
                      : isCurrentMonthDay
                        ? "bg-card hover:bg-muted/50"
                        : "bg-muted/30 text-muted-foreground"
                  }`}
                  onClick={() => openEventDialog(formatDate(date))}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${isTodayDate ? "text-primary" : ""}`}>{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, view === "month" ? 2 : 4).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(event)
                        }}
                      >
                        {event.time && <Clock className="w-3 h-3 inline mr-1" />}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > (view === "month" ? 2 : 4) && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - (view === "month" ? 2 : 4)} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <CardDescription>Your next 5 events</CardDescription>
        </CardHeader>
        <CardContent>
          {events
            .filter((event) => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color}`} />
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                      {event.time && ` at ${event.time}`}
                      {event.duration && ` (${event.duration}min)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{event.category}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(event)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          {events.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
            <p className="text-muted-foreground text-center py-4">No upcoming events</p>
          )}
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update your event details" : "Create a new calendar event"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Event title..."
              />
            </div>

            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="event-time">Time (Optional)</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-category">Category</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
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
                <Label htmlFor="event-duration">Duration (minutes)</Label>
                <Input
                  id="event-duration"
                  type="number"
                  min="15"
                  max="480"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewEvent((prev) => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full ${color} ${
                      newEvent.color === color ? "ring-2 ring-foreground ring-offset-2" : ""
                    }`}
                    title={`Select color ${color.replace("bg-", "").replace("-500", "")}`}
                    aria-label={`Select color ${color.replace("bg-", "").replace("-500", "")}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={editingEvent ? updateEvent : addEvent} className="flex-1">
                {editingEvent ? "Update Event" : "Add Event"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEventDialog(false)
                  setEditingEvent(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
