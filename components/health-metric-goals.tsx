"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { format, addDays, addMonths, isBefore, differenceInDays } from "date-fns"
import { CalendarIcon, Target, Plus, Edit, Trash2, CheckCircle, AlertCircle, Trophy, Bell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { MetricType, MetricDefinition } from "@/app/health-metrics/page"

export interface MetricGoal {
  id: string
  metricType: MetricType
  targetValue: number | { systolic: number; diastolic: number }
  startDate: string
  targetDate: string
  currentValue?: number | { systolic: number; diastolic: number }
  progress?: number
  notes?: string
  reminderEnabled: boolean
  reminderFrequency: "daily" | "weekly" | "custom"
  reminderDays?: number[] // 0-6 for Sunday-Saturday
  reminderTime?: string
  achieved: boolean
  achievedDate?: string
}

interface HealthMetricGoalsProps {
  metricType: MetricType
  metricDefinition: MetricDefinition
  goals: MetricGoal[]
  onAddGoal: (goal: Omit<MetricGoal, "id" | "progress" | "achieved" | "achievedDate">) => void
  onUpdateGoal: (goal: MetricGoal) => void
  onDeleteGoal: (goalId: string) => void
  latestValue?: number | { systolic: number; diastolic: number }
}

export function HealthMetricGoals({
  metricType,
  metricDefinition,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  latestValue,
}: HealthMetricGoalsProps) {
  const { toast } = useToast()
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    targetValue: "",
    targetSystolic: "",
    targetDiastolic: "",
    startDate: new Date(),
    targetDate: addMonths(new Date(), 1),
    notes: "",
    reminderEnabled: false,
    reminderFrequency: "daily" as const,
    reminderDays: [1, 3, 5], // Monday, Wednesday, Friday
    reminderTime: "09:00",
  })

  // Reset form when changing metric type
  useEffect(() => {
    setFormData({
      targetValue: "",
      targetSystolic: "",
      targetDiastolic: "",
      startDate: new Date(),
      targetDate: addMonths(new Date(), 1),
      notes: "",
      reminderEnabled: false,
      reminderFrequency: "daily",
      reminderDays: [1, 3, 5],
      reminderTime: "09:00",
    })
  }, [metricType])

  // Load goal data for editing
  useEffect(() => {
    if (editingGoalId) {
      const goalToEdit = goals.find((g) => g.id === editingGoalId)
      if (goalToEdit) {
        if (metricType === "blood_pressure" && typeof goalToEdit.targetValue === "object") {
          setFormData({
            targetValue: "",
            targetSystolic: goalToEdit.targetValue.systolic.toString(),
            targetDiastolic: goalToEdit.targetValue.diastolic.toString(),
            startDate: new Date(goalToEdit.startDate),
            targetDate: new Date(goalToEdit.targetDate),
            notes: goalToEdit.notes || "",
            reminderEnabled: goalToEdit.reminderEnabled,
            reminderFrequency: goalToEdit.reminderFrequency,
            reminderDays: goalToEdit.reminderDays || [1, 3, 5],
            reminderTime: goalToEdit.reminderTime || "09:00",
          })
        } else {
          setFormData({
            targetValue: typeof goalToEdit.targetValue === "number" ? goalToEdit.targetValue.toString() : "",
            targetSystolic: "",
            targetDiastolic: "",
            startDate: new Date(goalToEdit.startDate),
            targetDate: new Date(goalToEdit.targetDate),
            notes: goalToEdit.notes || "",
            reminderEnabled: goalToEdit.reminderEnabled,
            reminderFrequency: goalToEdit.reminderFrequency,
            reminderDays: goalToEdit.reminderDays || [1, 3, 5],
            reminderTime: goalToEdit.reminderTime || "09:00",
          })
        }
      }
    }
  }, [editingGoalId, goals, metricType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleReminderDayToggle = (day: number) => {
    setFormData((prev) => {
      const newDays = prev.reminderDays.includes(day)
        ? prev.reminderDays.filter((d) => d !== day)
        : [...prev.reminderDays, day]
      return {
        ...prev,
        reminderDays: newDays,
      }
    })
  }

  const handleSubmit = () => {
    // Validate form data
    if (metricType === "blood_pressure") {
      if (!formData.targetSystolic || !formData.targetDiastolic) {
        toast({
          title: "Missing values",
          description: "Please enter both systolic and diastolic target values.",
          variant: "destructive",
        })
        return
      }
    } else if (!formData.targetValue) {
      toast({
        title: "Missing value",
        description: "Please enter a target value.",
        variant: "destructive",
      })
      return
    }

    if (isBefore(formData.targetDate, formData.startDate)) {
      toast({
        title: "Invalid dates",
        description: "Target date must be after start date.",
        variant: "destructive",
      })
      return
    }

    // Create goal object
    const goalData: Omit<MetricGoal, "id" | "progress" | "achieved" | "achievedDate"> = {
      metricType,
      targetValue:
        metricType === "blood_pressure"
          ? {
              systolic: Number(formData.targetSystolic),
              diastolic: Number(formData.targetDiastolic),
            }
          : Number(formData.targetValue),
      startDate: formData.startDate.toISOString(),
      targetDate: formData.targetDate.toISOString(),
      notes: formData.notes,
      reminderEnabled: formData.reminderEnabled,
      reminderFrequency: formData.reminderFrequency,
      reminderDays: formData.reminderDays,
      reminderTime: formData.reminderTime,
    }

    if (editingGoalId) {
      // Update existing goal
      const goalToUpdate = goals.find((g) => g.id === editingGoalId)
      if (goalToUpdate) {
        onUpdateGoal({
          ...goalToUpdate,
          ...goalData,
        })
        toast({
          title: "Goal updated",
          description: "Your health goal has been updated successfully.",
        })
      }
      setEditingGoalId(null)
    } else {
      // Add new goal
      onAddGoal(goalData)
      toast({
        title: "Goal added",
        description: "Your new health goal has been added successfully.",
      })
    }

    // Reset form and close modal
    setIsAddingGoal(false)
  }

  const handleCancel = () => {
    setIsAddingGoal(false)
    setEditingGoalId(null)
  }

  // Format value for display
  const formatValue = (value: number | { systolic: number; diastolic: number }) => {
    if (metricType === "blood_pressure" && typeof value === "object") {
      return `${value.systolic}/${value.diastolic} ${metricDefinition.unit}`
    } else {
      return `${value} ${metricDefinition.unit}`
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (targetDate: string) => {
    const days = differenceInDays(new Date(targetDate), new Date())
    return days > 0 ? days : 0
  }

  // Get goal status
  const getGoalStatus = (goal: MetricGoal) => {
    if (goal.achieved) {
      return {
        label: "Achieved",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      }
    }

    const daysRemaining = getDaysRemaining(goal.targetDate)
    if (daysRemaining === 0) {
      return {
        label: "Expired",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      }
    }

    if (goal.progress && goal.progress >= 75) {
      return {
        label: "On Track",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      }
    }

    if (goal.progress && goal.progress >= 50) {
      return {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Target className="h-4 w-4 text-blue-500" />,
      }
    }

    return {
      label: "Just Started",
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Target className="h-4 w-4 text-amber-500" />,
    }
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500"
    if (progress >= 50) return "bg-blue-500"
    if (progress >= 25) return "bg-amber-500"
    return "bg-gray-500"
  }

  // Check if goal is achieved
  const checkGoalAchieved = (goal: MetricGoal) => {
    if (!latestValue || goal.achieved) return false

    if (metricType === "blood_pressure") {
      if (
        typeof goal.targetValue === "object" &&
        typeof latestValue === "object" &&
        latestValue.systolic <= goal.targetValue.systolic &&
        latestValue.diastolic <= goal.targetValue.diastolic
      ) {
        return true
      }
    } else {
      // For metrics where lower is better (like weight, cholesterol, blood glucose)
      if (
        ["weight", "cholesterol", "blood_glucose"].includes(metricType) &&
        typeof goal.targetValue === "number" &&
        typeof latestValue === "number" &&
        latestValue <= goal.targetValue
      ) {
        return true
      }
      // For metrics where higher is better (like steps, water_intake, oxygen_saturation)
      else if (
        ["steps", "water_intake", "oxygen_saturation"].includes(metricType) &&
        typeof goal.targetValue === "number" &&
        typeof latestValue === "number" &&
        latestValue >= goal.targetValue
      ) {
        return true
      }
    }

    return false
  }

  // Mark goal as achieved
  const markGoalAchieved = (goal: MetricGoal) => {
    onUpdateGoal({
      ...goal,
      achieved: true,
      achievedDate: new Date().toISOString(),
    })

    toast({
      title: "Goal achieved! 🎉",
      description: "Congratulations on achieving your health goal!",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Your {metricDefinition.name} Goals
        </h3>
        <Button onClick={() => setIsAddingGoal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md border border-gray-200">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
          <p className="text-gray-500 mb-4">
            Set goals for your {metricDefinition.name.toLowerCase()} to track your progress over time.
          </p>
          <Button onClick={() => setIsAddingGoal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Set Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => {
            // Check if goal should be marked as achieved
            if (!goal.achieved && checkGoalAchieved(goal)) {
              // We'll mark it as achieved in the next render cycle
              setTimeout(() => markGoalAchieved(goal), 0)
            }

            const status = getGoalStatus(goal)
            const daysRemaining = getDaysRemaining(goal.targetDate)

            return (
              <Card key={goal.id} className={goal.achieved ? "border-green-300 bg-green-50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {goal.achieved && <Trophy className="h-5 w-5 text-yellow-500" />}
                        Target: {formatValue(goal.targetValue)}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(goal.startDate), "MMM d, yyyy")} -{" "}
                        {format(new Date(goal.targetDate), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge className={status.color} variant="outline">
                      <span className="flex items-center gap-1">
                        {status.icon} {status.label}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progress || 0}%</span>
                      </div>
                      <Progress
                        value={goal.progress || 0}
                        className="h-2"
                        indicatorClassName={getProgressColor(goal.progress || 0)}
                      />
                    </div>

                    {goal.currentValue && (
                      <div className="flex justify-between text-sm">
                        <span>Current: {formatValue(goal.currentValue)}</span>
                        <span>Target: {formatValue(goal.targetValue)}</span>
                      </div>
                    )}

                    {!goal.achieved && daysRemaining > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                      </div>
                    )}

                    {goal.achieved && goal.achievedDate && (
                      <div className="text-sm text-green-600 font-medium">
                        Achieved on {format(new Date(goal.achievedDate), "MMMM d, yyyy")}
                      </div>
                    )}

                    {goal.reminderEnabled && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Bell className="h-4 w-4 mr-1" />
                        {goal.reminderFrequency === "daily" && "Daily reminder"}
                        {goal.reminderFrequency === "weekly" && "Weekly reminder"}
                        {goal.reminderFrequency === "custom" &&
                          `Reminder on ${goal.reminderDays
                            ?.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                            .join(", ")}`}
                        {goal.reminderTime && ` at ${goal.reminderTime}`}
                      </div>
                    )}

                    {goal.notes && <p className="text-sm text-muted-foreground">{goal.notes}</p>}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-end gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGoalId(goal.id)}
                      disabled={goal.achieved}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {(isAddingGoal || editingGoalId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingGoalId ? "Edit" : "Add"} {metricDefinition.name} Goal
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Target Value */}
              {metricType === "blood_pressure" ? (
                <div className="space-y-2">
                  <Label>Target Blood Pressure (mmHg)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Systolic"
                      name="targetSystolic"
                      type="number"
                      value={formData.targetSystolic}
                      onChange={handleInputChange}
                    />
                    <span>/</span>
                    <Input
                      placeholder="Diastolic"
                      name="targetDiastolic"
                      type="number"
                      value={formData.targetDiastolic}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Systolic / Diastolic</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target {metricDefinition.name}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="targetValue"
                      name="targetValue"
                      type="number"
                      step={metricType === "sleep" || metricType === "weight" ? "0.1" : "1"}
                      placeholder={`Enter target ${metricDefinition.name.toLowerCase()}`}
                      value={formData.targetValue}
                      onChange={handleInputChange}
                    />
                    <span className="text-gray-500">{metricDefinition.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {["weight", "cholesterol", "blood_glucose"].includes(metricType)
                      ? "Lower is better"
                      : ["steps", "water_intake", "oxygen_saturation"].includes(metricType)
                        ? "Higher is better"
                        : "Target value to achieve"}
                  </p>
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => date && setFormData((prev) => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.targetDate ? format(formData.targetDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.targetDate}
                        onSelect={(date) => date && setFormData((prev) => ({ ...prev, targetDate: date }))}
                        initialFocus
                        disabled={(date) => isBefore(date, formData.startDate)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Quick Date Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDate: addDays(prev.startDate, 7),
                    }))
                  }
                >
                  1 Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDate: addDays(prev.startDate, 14),
                    }))
                  }
                >
                  2 Weeks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDate: addMonths(prev.startDate, 1),
                    }))
                  }
                >
                  1 Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDate: addMonths(prev.startDate, 3),
                    }))
                  }
                >
                  3 Months
                </Button>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any additional notes or context for your goal"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              {/* Reminders */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminderEnabled" className="text-base">
                      Enable Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Get reminded to track your progress</p>
                  </div>
                  <Switch
                    id="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, reminderEnabled: checked }))}
                  />
                </div>

                {formData.reminderEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                      <Select
                        value={formData.reminderFrequency}
                        onValueChange={(value) =>
                          handleSelectChange("reminderFrequency", value as "daily" | "weekly" | "custom")
                        }
                      >
                        <SelectTrigger id="reminderFrequency">
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
                      <div className="space-y-2">
                        <Label>Reminder Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                            <Button
                              key={day}
                              type="button"
                              variant={formData.reminderDays.includes(index) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleReminderDayToggle(index)}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">Reminder Time</Label>
                      <Input
                        id="reminderTime"
                        name="reminderTime"
                        type="time"
                        value={formData.reminderTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  {editingGoalId ? "Update" : "Add"} Goal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
