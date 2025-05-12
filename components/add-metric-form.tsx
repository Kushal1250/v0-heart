"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  type: z.string().min(1, { message: "Please select a metric type" }),
  value: z.coerce.number().min(0, { message: "Value must be a positive number" }),
  unit: z.string().min(1, { message: "Please select a unit" }),
  date: z.string().min(1, { message: "Please select a date" }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Define metric types and their units
const metricTypes = [
  { value: "weight", label: "Weight", units: ["kg", "lbs"] },
  { value: "blood_pressure", label: "Blood Pressure", units: ["mmHg"] },
  { value: "heart_rate", label: "Heart Rate", units: ["bpm"] },
  { value: "cholesterol", label: "Cholesterol", units: ["mg/dL", "mmol/L"] },
  { value: "blood_glucose", label: "Blood Glucose", units: ["mg/dL", "mmol/L"] },
  { value: "steps", label: "Steps", units: ["steps"] },
  { value: "sleep", label: "Sleep", units: ["hours"] },
  { value: "water", label: "Water Intake", units: ["oz", "ml", "L"] },
]

type AddMetricFormProps = {
  onSubmit: (data: FormValues) => Promise<void>
  className?: string
  title?: string
  description?: string
}

export function AddMetricForm({
  onSubmit,
  className = "",
  title = "Add Health Metric",
  description = "Record a new health measurement",
}: AddMetricFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Get today's date in YYYY-MM-DD format for the date input default value
  const today = new Date().toISOString().split("T")[0]

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      value: 0,
      unit: "",
      date: today,
      notes: "",
    },
  })

  // Get available units for the selected metric type
  const availableUnits = selectedType ? metricTypes.find((type) => type.value === selectedType)?.units || [] : []

  // Handle form submission
  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset({
        type: data.type, // Keep the same type selected
        value: 0,
        unit: data.unit, // Keep the same unit selected
        date: today,
        notes: "",
      })
      toast({
        title: "Metric added",
        description: "Your health metric has been recorded successfully.",
      })
    } catch (error) {
      console.error("Error adding metric:", error)
      toast({
        title: "Error",
        description: "Failed to add health metric. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedType(value)
                      // Reset unit when type changes
                      form.setValue("unit", "")
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {metricTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Enter value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedType || availableUnits.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} max={today} />
                  </FormControl>
                  <FormDescription>When was this measurement taken?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes or context" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Metric"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
