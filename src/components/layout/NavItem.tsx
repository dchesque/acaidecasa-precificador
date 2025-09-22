"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { useState } from "react"

interface NavItemProps {
  href?: string
  icon?: React.ReactNode
  label: string
  isCollapsed?: boolean
  isSection?: boolean
  children?: React.ReactNode
  isSubItem?: boolean
  hasAdd?: boolean
  onAddClick?: () => void
  color?: string
}

export const NavItem = ({ 
  href, 
  icon, 
  label, 
  isCollapsed, 
  isSection = false, 
  children, 
  isSubItem = false,
  hasAdd = false,
  onAddClick,
  color
}: NavItemProps) => {
  const pathname = usePathname()
  const isActive = href && pathname === href
  const [isOpen, setIsOpen] = useState(false)

  if (isSection) {
    return (
      <div className="mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            {typeof icon === 'string' ? (
              <span className="text-base">{icon}</span>
            ) : icon && (
              <span className={cn("flex items-center justify-center", color)}>
                {icon}
              </span>
            )}
            <span className="font-medium">{label}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="mt-1 space-y-0.5 border-l-2 border-gray-700 ml-3 pl-2">
            {children}
          </div>
        )}
      </div>
    )
  }

  if (hasAdd && !href) {
    return (
      <button
        onClick={onAddClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group"
      >
        <Plus className={cn("h-4 w-4 group-hover:scale-110 transition-transform", color)} />
        <span>{label}</span>
      </button>
    )
  }

  if (!href) return null

  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center gap-2 px-3 text-sm rounded-lg transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "text-gray-300 hover:text-white hover:bg-white/10",
        isSubItem ? "pl-4 py-2" : "py-3"
      )}
    >
      {typeof icon === 'string' ? (
        <span className={cn("text-lg", color)}>{icon}</span>
      ) : icon && (
        <span className={cn("flex items-center justify-center", color)}>
          {icon}
        </span>
      )}
      <span className={cn("font-medium whitespace-nowrap", isSubItem && "text-sm")}>{label}</span>
    </Link>
  )
}