"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
};

export function FilterSelect({ value, onChange, options, placeholder, className }: FilterSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder ?? "Select"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
