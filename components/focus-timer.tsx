"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TimerState = "idle" | "running" | "paused"
type SessionType = "focus" | "shortBreak" | "longBreak"

export default function FocusTimer() {
  const [sessionType, setSessionType] = useState<SessionType>("focus")
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [customFocusTime, setCustomFocusTime] = useState(25)
  const [customShortBreak, setCustomShortBreak] = useState(5)
  const [customLongBreak, setCustomLongBreak] = useState(15)
  const [completedSessions, setCompletedSessions] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const sessionTimes = {
    focus: customFocusTime * 60,
    shortBreak: customShortBreak * 60,
    longBreak: customLongBreak * 60,
  }

  useEffect(() => {
    if (timerState === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, timeLeft])

  const handleSessionComplete = () => {
    setTimerState("idle")

    if (sessionType === "focus") {
      setCompletedSessions((prev) => prev + 1)
      // Auto-switch to break after focus session
      const nextSession = completedSessions % 4 === 3 ? "longBreak" : "shortBreak"
      setSessionType(nextSession)
      setTimeLeft(sessionTimes[nextSession])
    } else {
      // Auto-switch back to focus after break
      setSessionType("focus")
      setTimeLeft(sessionTimes.focus)
    }

    // Play notification sound (placeholder)
    console.log("Session completed!")
  }

  const startTimer = () => {
    setTimerState("running")
  }

  const pauseTimer = () => {
    setTimerState("paused")
  }

  const resetTimer = () => {
    setTimerState("idle")
    setTimeLeft(sessionTimes[sessionType])
  }

  const switchSession = (type: SessionType) => {
    setSessionType(type)
    setTimeLeft(sessionTimes[type])
    setTimerState("idle")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalTime = sessionTimes[sessionType]
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {sessionType === "focus"
                  ? "Focus Session"
                  : sessionType === "shortBreak"
                    ? "Short Break"
                    : "Long Break"}
              </CardTitle>
              <CardDescription>
                {sessionType === "focus" ? "Time to concentrate and get work done" : "Take a well-deserved break"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="relative">
                <div className="text-6xl font-mono font-bold text-foreground mb-4">{formatTime(timeLeft)}</div>

                {/* Progress Ring */}
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                      className="text-primary transition-all duration-1000 ease-linear"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {timerState === "idle" && (
                  <Button onClick={startTimer} size="lg" className="px-8">
                    Start
                  </Button>
                )}
                {timerState === "running" && (
                  <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8">
                    Pause
                  </Button>
                )}
                {timerState === "paused" && (
                  <>
                    <Button onClick={startTimer} size="lg" className="px-6">
                      Resume
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="lg" className="px-6 bg-transparent">
                      Reset
                    </Button>
                  </>
                )}
                {timerState !== "idle" && (
                  <Button onClick={resetTimer} variant="outline" size="lg" className="px-6 bg-transparent">
                    Reset
                  </Button>
                )}
              </div>

              {/* Session Type Switcher */}
              <div className="flex justify-center space-x-2">
                <Button
                  variant={sessionType === "focus" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchSession("focus")}
                  disabled={timerState === "running"}
                >
                  Focus
                </Button>
                <Button
                  variant={sessionType === "shortBreak" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchSession("shortBreak")}
                  disabled={timerState === "running"}
                >
                  Short Break
                </Button>
                <Button
                  variant={sessionType === "longBreak" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchSession("longBreak")}
                  disabled={timerState === "running"}
                >
                  Long Break
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings & Stats */}
        <div className="space-y-6">
          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timer Settings</CardTitle>
              <CardDescription>Customize your session lengths</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="focus-time">Focus Time (minutes)</Label>
                <Input
                  id="focus-time"
                  type="number"
                  min="1"
                  max="120"
                  value={customFocusTime}
                  onChange={(e) => setCustomFocusTime(Number(e.target.value))}
                  disabled={timerState === "running"}
                />
              </div>
              <div>
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                  disabled={timerState === "running"}
                />
              </div>
              <div>
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                  disabled={timerState === "running"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Progress</CardTitle>
              <CardDescription>Track your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{completedSessions}</div>
                <div className="text-sm text-muted-foreground">Focus sessions completed</div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Total focus time: {Math.floor((completedSessions * customFocusTime) / 60)}h{" "}
                  {(completedSessions * customFocusTime) % 60}m
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
