"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Search } from "lucide-react"
import Image from "next/image"

interface ParkingSlot {
  id: string
  slotNumber: string
  zone: string
  type: "STANDARD" | "PREMIUM" | "DISABLED"
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED"
  vehicle?: {
    id: string
    licensePlate: string
    model: string
    color: string
    owner: string
  }
  booking?: {
    id: string
    startTime: string
    endTime?: string
    duration: number
    cost: number
    status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  }
  pricePerHour: number
  features: string[]
  lastUpdated: string
}

interface SlotsData {
  slots: ParkingSlot[]
  stats: {
    total: number
    available: number
    occupied: number
    maintenance: number
    reserved: number
  }
  parkingSpot: {
    id: string
    name: string
    address: string
    totalSpots: number
    availableSpots: number
    pricePerHour: number
  }
}

// Fetch slots from backend API
async function fetchSlots(): Promise<SlotsData> {
  try {
    const response = await fetch('http://localhost:3000/api/dashboard/slots')
    if (!response.ok) {
      throw new Error('Failed to fetch slots')
    }
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching slots:', error)
    
    // Fallback data for demo
    const fallbackSlots: ParkingSlot[] = Array.from({ length: 50 }, (_, i) => {
      const slotNumber = `A${(i + 1).toString().padStart(2, '0')}`
      return {
        id: (i + 1).toString(),
        slotNumber,
        zone: `Zone ${Math.ceil((i + 1) / 10)}`,
        type: i < 5 ? 'PREMIUM' : i < 10 ? 'DISABLED' : 'STANDARD',
        status: i === 0 ? 'OCCUPIED' : 'AVAILABLE',
        vehicle: i === 0 ? {
          id: '1',
          licensePlate: 'MH12QB2053',
          model: 'Honda Civic',
          color: 'Blue',
          owner: 'John Doe'
        } : undefined,
        booking: i === 0 ? {
          id: '1',
          startTime: new Date().toISOString(),
          duration: 2,
          cost: 20,
          status: 'ACTIVE'
        } : undefined,
        pricePerHour: 10,
        features: i < 5 ? ['Premium', 'Covered'] : i < 10 ? ['Disabled Access', 'Wide Space'] : ['Standard'],
        lastUpdated: new Date().toISOString()
      }
    })

    return {
      slots: fallbackSlots,
      stats: {
        total: 50,
        available: 49,
        occupied: 1,
        maintenance: 0,
        reserved: 0
      },
      parkingSpot: {
        id: '1',
        name: 'TechWagon Parking',
        address: 'Mumbai, India',
        totalSpots: 50,
        availableSpots: 49,
        pricePerHour: 10
      }
    }
  }
}

export default function SlotsPage() {
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)

  // Load slots on component mount and set up auto-refresh
  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true)
      const data = await fetchSlots()
      setSlotsData(data)
      setLoading(false)
    }
    
    loadSlots()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSlots, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshSlots = async () => {
    setLoading(true)
    const data = await fetchSlots()
    setSlotsData(data)
    setLoading(false)
  }

  // Filter slots based on search and filters
  const filteredSlots = slotsData?.slots.filter(slot => {
    const matchesSearch = 
      slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.vehicle?.owner.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || slot.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  }) || []

  const getSlotColor = (status: string, type: string) => {
    switch (status) {
      case "OCCUPIED": return "bg-red-100 border-red-300"
      case "AVAILABLE": 
        switch (type) {
          case "PREMIUM": return "bg-yellow-50 border-yellow-300"
          case "DISABLED": return "bg-blue-50 border-blue-300"
          default: return "bg-green-50 border-green-300"
        }
      case "MAINTENANCE": return "bg-orange-100 border-orange-300"
      case "RESERVED": return "bg-purple-100 border-purple-300"
      default: return "bg-gray-100 border-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "text-green-600"
      case "OCCUPIED": return "text-red-600"
      case "MAINTENANCE": return "text-orange-600"
      case "RESERVED": return "text-purple-600"
      default: return "text-gray-600"
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading && !slotsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading parking slots...</div>
      </div>
    )
  }

  if (!slotsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Failed to load parking slots</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parking Slots</h1>
          <p className="text-muted-foreground">Visual overview of {slotsData.parkingSpot.name}</p>
        </div>
        <Button onClick={refreshSlots} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center">{slotsData.stats.total}</div>
            <div className="text-sm text-center text-muted-foreground">Total Slots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-green-600">{slotsData.stats.available}</div>
            <div className="text-sm text-center text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-red-600">{slotsData.stats.occupied}</div>
            <div className="text-sm text-center text-muted-foreground">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-orange-600">{slotsData.stats.maintenance}</div>
            <div className="text-sm text-center text-muted-foreground">Maintenance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-purple-600">{slotsData.stats.reserved}</div>
            <div className="text-sm text-center text-muted-foreground">Reserved</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by slot number, license plate, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
              <span>Disabled Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Reserved</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Parking Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Layout</CardTitle>
          <CardDescription>Click on any slot to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`
                  relative aspect-square border-2 rounded-lg cursor-pointer 
                  transition-all duration-200 hover:scale-105 hover:shadow-md
                  ${getSlotColor(slot.status, slot.type)}
                `}
                onClick={() => setSelectedSlot(slot)}
                title={`${slot.slotNumber} - ${slot.status} ${slot.vehicle ? '- ' + slot.vehicle.licensePlate : ''}`}
              >
                {/* Slot Number */}
                <div className="absolute top-1 left-1 text-xs font-semibold">
                  {slot.slotNumber}
                </div>
                
                {/* Type indicator */}
                <div className="absolute top-1 right-1 text-xs">
                  {slot.type === 'PREMIUM' && '⭐'}
                  {slot.type === 'DISABLED' && '♿'}
                </div>

                {/* Car image for occupied slots */}
                {slot.status === 'OCCUPIED' && slot.vehicle && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/images/car.png"
                      alt="Car"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Status indicator for non-occupied slots */}
                {slot.status !== 'OCCUPIED' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-xs font-semibold ${getStatusColor(slot.status)}`}>
                      {slot.status === 'AVAILABLE' && '✓'}
                      {slot.status === 'MAINTENANCE' && '🔧'}
                      {slot.status === 'RESERVED' && '📅'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Slot {selectedSlot.slotNumber}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>
                  ✕
                </Button>
              </div>
              <Badge variant={selectedSlot.status === 'OCCUPIED' ? 'destructive' : 'default'}>
                {selectedSlot.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Zone</div>
                  <div className="font-semibold">{selectedSlot.zone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-semibold">{selectedSlot.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Price/Hour</div>
                  <div className="font-semibold">₹{selectedSlot.pricePerHour}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Features</div>
                  <div className="text-sm">{selectedSlot.features.join(', ')}</div>
                </div>
              </div>
              
              {selectedSlot.vehicle && selectedSlot.booking && (
                <div className="border-t pt-4">
                  <div className="text-lg font-semibold mb-2">Current Booking</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vehicle:</span>
                      <span className="font-semibold">{selectedSlot.vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span>{selectedSlot.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Owner:</span>
                      <span>{selectedSlot.vehicle.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Start Time:</span>
                      <span>{formatTime(selectedSlot.booking.startTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{selectedSlot.booking.duration}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-semibold">₹{selectedSlot.booking.cost}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}