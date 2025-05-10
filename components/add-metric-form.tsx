"use client"

import type React from "react"

import { useState } from "react"
import type { MetricType, MetricDefinition } from "@/app/health-metrics/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

interface AddMetricFormProps {
  metricType: MetricType
  metricDefinition: MetricDefinition
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AddMetricForm({ metricType, metricDefinition, onSubmit, onCancel }: AddMetricFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for different metric types
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create timestamp from date and time
      const timestamp = new Date(date!)
      const [hours, minutes] = time.split(":").map(Number)
      timestamp.setHours(hours, minutes)

      // Create metric data based on type
      const metricData: any = {
        type: metricType,
        unit: metricDefinition.unit,
        notes,
      }

      if (metricType === "blood_pressure") {
        metricData.value = {
          systolic: Number.parseInt(systolic),
          diastolic: Number.parseInt(diastolic),
        }
      } else {
        metricData.value = Number.parseFloat(value)
      }

      onSubmit(metricData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Metric Value */}
      {metricType === "blood_pressure" ? (
        <div className="space-y-2">
          <Label>Blood Pressure (mmHg)</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Systolic"
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              required
            />
            <span>/</span>
            <Input
              placeholder="Diastolic"
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Systolic / Diastolic</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="value">{metricDefinition.name}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="value"
              type="number"
              step={metricType === "sleep" || metricType === "weight" ? "0.1" : "1"}
              placeholder={`Enter ${metricDefinition.name.toLowerCase()}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <span className="text-gray-500">{metricDefinition.unit}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes or context"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Reading"}
        </Button>
      </div>
    </form>
  )
}
