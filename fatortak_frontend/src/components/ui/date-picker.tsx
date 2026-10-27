"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { arEG, enUS } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLanguage } from "@/contexts/LanguageContext"
import { formatDate } from "@/Helpers/localization"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function DatePicker({ date, setDate, disabled, className, placeholder }: DatePickerProps) {
  const { isRTL, language } = useLanguage()

  const locale = language === 'ar' ? arEG : enUS

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 h-auto",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className={cn("mw-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {date ? (
            formatDate(date)
          ) : (
            <span>{placeholder || (isRTL ? "اختر تاريخ" : "Pick a date")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={locale}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </PopoverContent>
    </Popover>
  )
}
