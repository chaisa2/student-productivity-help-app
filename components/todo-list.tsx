"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit3, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  category: string
  priority: "low" | "medium" | "high"
  createdAt: Date
  dueDate?: Date
}

const CATEGORIES = ["Personal", "Work", "Study", "Health", "Other"]
const PRIORITIES = ["low", "medium", "high"] as const

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Study",
    priority: "medium" as const,
    dueDate: "",
  })
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("studyflow-tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))
      setTasks(parsedTasks)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("studyflow-tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      completed: false,
      category: newTask.category,
      priority: newTask.priority,
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    }

    setTasks((prev) => [task, ...prev])
    setNewTask({
      title: "",
      description: "",
      category: "Study",
      priority: "medium",
      dueDate: "",
    })
    setShowAddForm(false)
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
    setEditingTask(null)
  }

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === "all" || (filter === "active" && !task.completed) || (filter === "completed" && task.completed)

    const categoryMatch = categoryFilter === "all" || task.category === categoryFilter

    return statusMatch && categoryMatch
  })

  const getProgressStats = () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const stats = getProgressStats()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.total - stats.completed}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">{stats.percentage}%</div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Add Task Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-category">Category</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value }))}
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
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="task-due">Due Date (Optional)</Label>
                    <Input
                      id="task-due"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={addTask} size="sm" className="flex-1">
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

        {/* Task List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Tasks</CardTitle>
                  <CardDescription>Manage and track your to-do items</CardDescription>
                </div>

                {/* Filters */}
                <div className="flex space-x-2">
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {tasks.length === 0 ? "No tasks yet. Add your first task!" : "No tasks match your current filters."}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg transition-colors ${task.completed ? "bg-muted/50" : "bg-card"}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {task.title}
                            </h3>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            <Badge variant="secondary" className="text-xs">
                              {task.category}
                            </Badge>
                          </div>

                          {task.description && (
                            <p
                              className={`text-sm mb-2 ${task.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                            >
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Created: {task.createdAt.toLocaleDateString()}</span>
                            {task.dueDate && (
                              <span className={task.dueDate < new Date() && !task.completed ? "text-red-500" : ""}>
                                Due: {task.dueDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingTask(task.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
