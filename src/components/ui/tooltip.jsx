import React from "react"
import { cn } from "../../lib/utils"

const Tooltip = React.forwardRef(({ className, content, children, ...props }, ref) => {
  return (
    <div className="relative group" ref={ref} {...props}>
      {children}
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block",
          className
        )}
      >
        <div className="bg-black text-white text-xs p-1 rounded-md whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  )
})
Tooltip.displayName = "Tooltip"

const TooltipProvider = ({ children }) => {
  return <>{children}</>
}
TooltipProvider.displayName = "TooltipProvider"

const TooltipTrigger = ({ children }) => {
  return <>{children}</>
}
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = ({ children }) => {
  return <>{children}</>
}
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent }
