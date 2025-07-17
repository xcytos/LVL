import React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return (
    <option ref={ref} value={value} className={cn("", className)} {...props}>
      {children}
    </option>
  )
})
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef(({ placeholder, ...props }, ref) => {
  return (
    <span ref={ref} {...props}>
      {placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
