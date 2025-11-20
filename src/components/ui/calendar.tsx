import React, { useState } from "react";
import { DayPicker, DateRange, DayPickerDefaultProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
// Assuming you have a file ./select.tsx with the Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// --- Helper function to replace date-fns/addDays ---
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const Calendar = () => {
  const [mode, setMode] = useState<"single" | "multiple" | "range">("single");

  const today = new Date();
  const nextMonth = addDays(today, 30);

  const [singleDate, setSingleDate] = useState<Date | undefined>(today);
  const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([
    today,
  ]);
  const [range, setRange] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });

  const handleModeChange = (value: "single" | "multiple" | "range") => {
    setMode(value);
  };

  const disabledDays = [
    new Date(2025, 6, 25), 
    new Date(2025, 6, 26), 
    {
      from: new Date(2025, 6, 28), 
      to: new Date(2025, 6, 30), 
    },
    (date: Date) => date.getDay() === 0 || date.getDay() === 6, // disable weekends
  ];

  // FIX: Define the common props using the base DayPickerDefaultProps type
  // or simply let TypeScript infer it as an object type.
  const commonDayPickerProps: DayPickerDefaultProps = {
    className: "rounded-lg border p-4",
    weekStartsOn: 1, 
    defaultMonth: today,
    fromDate: today,
    toDate: nextMonth,
    disabled: disabledDays,
    showOutsideDays: true,
    initialFocus: true,
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* --- Mode Selector --- */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <label className="text-gray-700 dark:text-gray-300 font-medium">
          Selection Mode:
        </label>
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-white border rounded-md px-3 py-2">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="multiple">Multiple</SelectItem>
            <SelectItem value="range">Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <hr className="my-6"/>

      {/* --- DayPickers --- */}
      <div className="flex justify-center">
        {mode === "single" && (
          <DayPicker
            mode="single"
            selected={singleDate}
            onSelect={setSingleDate}
            required={false}
            {...commonDayPickerProps}
          />
        )}

        {mode === "multiple" && (
          <DayPicker
            mode="multiple"
            selected={multipleDates}
            onSelect={setMultipleDates}
            {...commonDayPickerProps}
          />
        )}

        {mode === "range" && (
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            {...commonDayPickerProps}
          />
        )}
      </div>

      <hr className="my-6"/>

      {/* --- Display Selected Dates --- */}
      <div className="mt-6 text-center text-gray-800 dark:text-gray-200">
        <h3 className="text-lg font-bold mb-2">Selected Dates</h3>
        {mode === "single" && singleDate && (
          <p>
            Selected:{" "}
            <strong>{singleDate.toLocaleDateString("en-US")}</strong>
          </p>
        )}
        {mode === "multiple" && multipleDates && (
          <p>
            Selected:{" "}
            {multipleDates.length > 0
              ? multipleDates.map((date) => (
                  <span key={date.toString()} className="mx-1 font-mono text-sm">
                    {date.toLocaleDateString("en-US")}
                  </span>
                ))
              : "None"}
          </p>
        )}
        {mode === "range" && range && (
          <p>
            From:{" "}
            <strong>{range.from?.toLocaleDateString("en-US") || "—"}</strong>{" "}
            to: <strong>{range.to?.toLocaleDateString("en-US") || "—"}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
