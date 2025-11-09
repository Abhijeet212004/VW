"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  ParkingCircle,
  Users,
  BarChart3,
  Settings,
  MapPin,
  CreditCard,
  Clock,
  AlertTriangle,
  Menu,
  X,
  Activity
} from "lucide-react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
  { name: "Parking Slots", href: "/dashboard/slots", icon: ParkingCircle },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Bookings", href: "/dashboard/bookings", icon: MapPin },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Live Monitoring", href: "/dashboard/live", icon: Clock },
  { name: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ParkingCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TechWagon</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  {item.name}
                  {item.name === "Alerts" && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">
                      3
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Status */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}