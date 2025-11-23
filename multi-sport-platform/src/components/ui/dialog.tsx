import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      <AnimatePresence>
        {open && children}
      </AnimatePresence>
    </DialogContext.Provider>
  )
}

export const DialogContent: React.FC<HTMLMotionProps<"div"> & { children: React.ReactNode }> = ({ className, children, ...props }) => {
  const { onOpenChange } = React.useContext(DialogContext)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden",
          className
        )}
        {...props}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-slate-400 hover:text-white" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </motion.div>
    </div>
  )
}

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-slate-800", className)}
    {...props}
  />
)

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-800 bg-slate-950/30", className)}
    {...props}
  />
)

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h2
    className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  />
)

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-slate-400", className)}
    {...props}
  />
)
