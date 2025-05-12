"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Target, Bell } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface HealthMetricGoal {
  id: number
  user_id: string
  metric_type: string
  current_value: number
  target_value: number
  start_value: number
  unit: string
  start_date: string
  target_date: string
  completed_date: string | null
  notes: string | null
  reminders_enabled: boolean
  reminder_frequency: string | null
  reminder_days: number[] | null
  reminder_time: string | null
  created_at: string
  updated_at: string
  goal_type: "lower" | "higher" | "maintain"
}

interface MetricOption {
  value: string
  label: string
  unit: string
  goalType: "lower" | "higher" | "maintain"
}

interface GoalFormValues {
  metricType: string
  startValue: number
  targetValue: number
  unit: string
  startDate: string
  targetDate: string
  notes?: string
  remindersEnabled: boolean
  reminderFrequency?: string
  reminderDays?: number[]
  reminderTime?: string
}

const metricOptions: MetricOption[] = [
  { value: "weight", label: "Weight", unit: "kg", goalType: "lower" },
  { value: "blood_pressure_systolic", label: "Blood Pressure (Systolic)", unit: "mmHg", goalType: "lower" },
  { value: "blood_pressure_diastolic", label: "Blood Pressure (Diastolic)", unit: "mmHg", goalType: "lower" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", goalType: "lower" },
  { value: "cholesterol_total", label: "Total Cholesterol", unit: "mg/dL", goalType: "lower" },
  { value: "cholesterol_ldl", label: "LDL Cholesterol", unit: "mg/dL", goalType: "lower" },
  { value: "cholesterol_hdl", label: "HDL Cholesterol", unit: "mg/dL", goalType: "higher" },
  { value: "triglycerides", label: "Triglycerides", unit: "mg/dL", goalType: "lower" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL", goalType: "maintain" },
  { value: "steps", label: "Daily Steps", unit: "steps", goalType: "higher" },
  { value: "exercise", label: "Weekly Exercise", unit: "minutes", goalType: "higher" },
  { value: "water", label: "Daily Water Intake", unit: "ml", goalType: "higher" },
  { value: "sleep", label: "Sleep Duration", unit: "hours", goalType: "higher" },
]

interface HealthMetricGoalsProps {
  metrics?: any[]
  className?: string
}

export function HealthMetricGoals({ metrics = [], className = "" }: HealthMetricGoalsProps) {
  const [goals, setGoals] = useState<HealthMetricGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [currentGoal, setCurrentGoal] = useState<HealthMetricGoal | null>(null)

  // Form state
  const [formData, setFormData] = useState<GoalFormValues>({
    metricType: "",
    startValue: 0,
    targetValue: 0,
    unit: "",
    startDate: new Date().toISOString().split("T")[0],
    targetDate: "",
    notes: "",
    remindersEnabled: false,
    reminderFrequency: "daily",
    reminderDays: [1, 3, 5], // Mon, Wed, Fri
    reminderTime: "08:00",
  })

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals()
  }, [activeTab])

  // Fetch all goals for the current user
  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/health-metric-goals?tab=${activeTab}`)

      if (!response.ok) {
        throw new Error("Failed to fetch goals")
      }

      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error("Error fetching goals:", error)
      toast({
        title: "Error",
        description: "Failed to load health goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new goal
  const createGoal = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/health-metric-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metricType: formData.metricType,
          startValue: formData.startValue,
          targetValue: formData.targetValue,
          unit: formData.unit,
          startDate: formData.startDate,
          targetDate: formData.targetDate,
          notes: formData.notes,
          remindersEnabled: formData.remindersEnabled,
          reminderFrequency: formData.remindersEnabled ? formData.reminderFrequency : null,
          reminderDays:
            formData.remindersEnabled && formData.reminderFrequency === "custom" ? formData.reminderDays : null,
          reminderTime: formData.reminderTime ? formData.reminderTime : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create goal")
      }

      toast({
        title: "Goal Created",
        description: "Your health goal has been created successfully.",
      })

      setIsAddGoalOpen(false)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "Error",
        description: "Failed to create health goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update an existing goal
  const updateGoal = async () => {
    if (!currentGoal) return

    try {
      setLoading(true)

      const response = await fetch(`/api/health-metric-goals/${currentGoal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metricType: formData.metricType,
          startValue: formData.startValue,
          targetValue: formData.targetValue,
          unit: formData.unit,
          startDate: formData.startDate,
          targetDate: formData.targetDate,
          notes: formData.notes,
          remindersEnabled: formData.remindersEnabled,
          reminderFrequency: formData.remindersEnabled ? formData.reminderFrequency : null,
          reminderDays:
            formData.remindersEnabled && formData.reminderFrequency === "custom" ? formData.reminderDays : null,
          reminderTime: formData.reminderTime ? formData.reminderTime : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update goal")
      }

      toast({
        title: "Goal Updated",
        description: "Your health goal has been updated successfully.",
      })

      setIsEditGoalOpen(false)
      setCurrentGoal(null)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description: "Failed to update health goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a goal
  const deleteGoal = async (goalId: number) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/health-metric-goals/${goalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete goal")
      }

      toast({
        title: "Goal Deleted",
        description: "Your health goal has been deleted successfully.",
      })

      fetchGoals()
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete health goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mark a goal as complete
  const markGoalAsComplete = async (goalId: number) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/health-metric-goals/${goalId}/complete`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to mark goal as complete")
      }

      toast({
        title: "Goal Completed",
        description: "Congratulations! Your health goal has been marked as complete.",
      })

      fetchGoals()
    } catch (error) {
      console.error("Error completing goal:", error)
      toast({
        title: "Error",
        description: "Failed to mark goal as complete. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      metricType: "",
      startValue: 0,
      targetValue: 0,
      unit: "",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
      notes: "",
      remindersEnabled: false,
      reminderFrequency: "daily",
      reminderDays: [1, 3, 5],
      reminderTime: "08:00",
    })
  }

  // Open edit goal dialog
  const openEditGoal = (goal: HealthMetricGoal) => {
    setCurrentGoal(goal)
    setFormData({
      metricType: goal.metric_type,
      startValue: goal.start_value,
      targetValue: goal.target_value,
      unit: goal.unit,
      startDate: goal.start_date.split("T")[0],
      targetDate: goal.target_date.split("T")[0],
      notes: goal.notes || "",
      remindersEnabled: goal.reminders_enabled,
      reminderFrequency: goal.reminder_frequency || "daily",
      reminderDays: goal.reminder_days || [1, 3, 5],
      reminderTime: goal.reminder_time || "08:00",
    })
    setIsEditGoalOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // If metric type changes, update the unit
    if (name === "metricType") {
      const metric = metricOptions.find((m) => m.value === value)
      if (metric) {
        setFormData((prev) => ({ ...prev, unit: metric.unit }))
      }
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle reminder day selection
  const handleReminderDayChange = (day: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      reminderDays: checked ? [...(prev.reminderDays || []), day] : (prev.reminderDays || []).filter((d) => d !== day),
    }))
  }

  // Calculate progress percentage
  const calculateProgress = (goal: HealthMetricGoal) => {
    if (goal.completed_date) return 100

    const start = goal.start_value
    const target = goal.target_value
    const current = goal.current_value

    if (goal.goal_type === "lower") {
      // For goals where lower is better (e.g., weight loss)
      if (start <= target) return 0 // Invalid goal (start should be higher than target)

      const totalChange = start - target
      const currentChange = start - current

      return Math.min(100, Math.max(0, Math.round((currentChange / totalChange) * 100)))
    } else if (goal.goal_type === "higher") {
      // For goals where higher is better (e.g., steps)
      if (start >= target) return 0 // Invalid goal (start should be lower than target)

      const totalChange = target - start
      const currentChange = current - start

      return Math.min(100, Math.max(0, Math.round((currentChange / totalChange) * 100)))
    } else {
      // For maintenance goals
      const deviation = Math.abs(current - target)
      const allowedDeviation = target * 0.05 // 5% deviation allowed
      return Math.min(100, Math.max(0, 100 - Math.round((deviation / allowedDeviation) * 100)))
    }
  }

  // Get goal status
  const getGoalStatus = (goal: HealthMetricGoal) => {
    if (goal.completed_date) {
      return { label: "Achieved", variant: "default" as const }
    }

    const progress = calculateProgress(goal)
    const targetDate = new Date(goal.target_date)
    const now = new Date()

    if (targetDate < now) {
      return { label: "Expired", variant: "destructive" as const }
    }

    if (progress >= 75) {
      return { label: "On Track", variant: "success" as const }
    }

    if (progress >= 30) {
      return { label: "In Progress", variant: "warning" as const }
    }

    return { label: "Just Started", variant: "outline" as const }
  }

  // Get days remaining for a goal
  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const days = differenceInDays(target, now)
    return days >= 0 ? days : 0
  }

  // Set quick target date
  const setQuickTargetDate = (days: number) => {
    const date = addDays(new Date(), days)
    setFormData((prev) => ({
      ...prev,
      targetDate: date.toISOString().split("T")[0],
    }))
  }

  // Get metric details by type
  const getMetricDetails = (metricType: string) => {
    return (
      metricOptions.find((option) => option.value === metricType) || {
        value: metricType,
        label: metricType,
        unit: "",
        goalType: "lower" as const,
      }
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Health Metric Goals</h2>
        <Button onClick={() => setIsAddGoalOpen(true)}>
          <Target className="mr-2 h-4 w-4" />
          Set New Goal
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-500">No goals found</p>
                <p className="text-sm text-gray-400 mb-4">Set a new goal to start tracking your progress</p>
                <Button onClick={() => setIsAddGoalOpen(true)}>Set Your First Goal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const metricDetails = getMetricDetails(goal.metric_type)
                const progress = calculateProgress(goal)
                const status = getGoalStatus(goal)
                const daysRemaining = getDaysRemaining(goal.target_date)

                return (
                  <Card key={goal.id} className={goal.completed_date ? "border-green-300" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{metricDetails.label}</CardTitle>
                          <CardDescription>
                            {goal.goal_type === "lower"
                              ? "Decrease to"
                              : goal.goal_type === "higher"
                                ? "Increase to"
                                : "Maintain around"}{" "}
                            {goal.target_value} {goal.unit}
                          </CardDescription>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Current</p>
                          <p className="font-medium">
                            {goal.current_value} {goal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Target</p>
                          <p className="font-medium">
                            {goal.target_value} {goal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium">{format(new Date(goal.start_date), "MMM d, yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Target Date</p>
                          <p className="font-medium">{format(new Date(goal.target_date), "MMM d, yyyy")}</p>
                        </div>
                      </div>

                      {goal.notes && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-500">Notes</p>
                          <p className="text-gray-700">{goal.notes}</p>
                        </div>
                      )}

                      {!goal.completed_date && daysRemaining > 0 && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                          </span>
                        </div>
                      )}

                      {goal.reminders_enabled && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Bell className="h-4 w-4 mr-1" />
                          <span>
                            Reminders:{" "}
                            {goal.reminder_frequency === "daily"
                              ? "Daily"
                              : goal.reminder_frequency === "weekly"
                                ? "Weekly"
                                : "Custom"}{" "}
                            {goal.reminder_time && `at ${goal.reminder_time.substring(0, 5)}`}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditGoal(goal)}
                          disabled={!!goal.completed_date}
                        >
                          Edit
                        </Button>
                        <div className="space-x-2">
                          {!goal.completed_date && (
                            <Button variant="default" size="sm" onClick={() => markGoalAsComplete(goal.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => deleteGoal(goal.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set a New Health Goal</DialogTitle>
            <DialogDescription>
              Define a target for your health metrics and track your progress over time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metricType" className="text-right">
                Metric
              </Label>
              <Select value={formData.metricType} onValueChange={(value) => handleSelectChange("metricType", value)}>
                <SelectTrigger className="col-span-3" id="metricType">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startValue" className="text-right">
                Current Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="startValue"
                  name="startValue"
                  type="number"
                  step="0.1"
                  value={formData.startValue}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                {formData.unit && <span className="ml-2 text-sm text-gray-500">{formData.unit}</span>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetValue" className="text-right">
                Target Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="targetValue"
                  name="targetValue"
                  type="number"
                  step="0.1"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                {formData.unit && <span className="ml-2 text-sm text-gray-500">{formData.unit}</span>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">
                Target Date
              </Label>
              <div className="col-span-3">
                <Input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickTargetDate(7)}>
                    1 Week
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickTargetDate(14)}>
                    2 Weeks
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickTargetDate(30)}>
                    1 Month
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickTargetDate(90)}>
                    3 Months
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Add any notes about your goal"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Reminders</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="remindersEnabled"
                  checked={formData.remindersEnabled}
                  onCheckedChange={(checked) => handleCheckboxChange("remindersEnabled", checked === true)}
                />
                <label
                  htmlFor="remindersEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable reminders for this goal
                </label>
              </div>
            </div>

            {formData.remindersEnabled && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reminderFrequency" className="text-right">
                    Frequency
                  </Label>
                  <Select
                    value={formData.reminderFrequency || "daily"}
                    onValueChange={(value) => handleSelectChange("reminderFrequency", value)}
                  >
                    <SelectTrigger className="col-span-3" id="reminderFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.reminderFrequency === "custom" && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Days</Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={formData.reminderDays?.includes(index) || false}
                            onCheckedChange={(checked) => handleReminderDayChange(index, checked === true)}
                          />
                          <label htmlFor={`day-${index}`} className="text-sm font-medium leading-none">
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reminderTime" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="reminderTime"
                    name="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createGoal}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Health Goal</DialogTitle>
            <DialogDescription>Update your health goal details and progress.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-metricType" className="text-right">
                Metric
              </Label>
              <Select value={formData.metricType} onValueChange={(value) => handleSelectChange("metricType", value)}>
                <SelectTrigger className="col-span-3" id="edit-metricType">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startValue" className="text-right">
                Current Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="edit-startValue"
                  name="startValue"
                  type="number"
                  step="0.1"
                  value={formData.startValue}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                {formData.unit && <span className="ml-2 text-sm text-gray-500">{formData.unit}</span>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-targetValue" className="text-right">
                Target Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="edit-targetValue"
                  name="targetValue"
                  type="number"
                  step="0.1"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                {formData.unit && <span className="ml-2 text-sm text-gray-500">{formData.unit}</span>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-targetDate" className="text-right">
                Target Date
              </Label>
              <Input
                id="edit-targetDate"
                name="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Add any notes about your goal"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Reminders</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-remindersEnabled"
                  checked={formData.remindersEnabled}
                  onCheckedChange={(checked) => handleCheckboxChange("remindersEnabled", checked === true)}
                />
                <label
                  htmlFor="edit-remindersEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable reminders for this goal
                </label>
              </div>
            </div>

            {formData.remindersEnabled && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reminderFrequency" className="text-right">
                    Frequency
                  </Label>
                  <Select
                    value={formData.reminderFrequency || "daily"}
                    onValueChange={(value) => handleSelectChange("reminderFrequency", value)}
                  >
                    <SelectTrigger className="col-span-3" id="edit-reminderFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.reminderFrequency === "custom" && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Days</Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                        <div key={`edit-${day}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-day-${index}`}
                            checked={formData.reminderDays?.includes(index) || false}
                            onCheckedChange={(checked) => handleReminderDayChange(index, checked === true)}
                          />
                          <label htmlFor={`edit-day-${index}`} className="text-sm font-medium leading-none">
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reminderTime" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="edit-reminderTime"
                    name="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateGoal}>Update Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
