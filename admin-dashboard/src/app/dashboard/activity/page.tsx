"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Download, Eye } from "lucide-react"
import { format } from "date-fns"

interface CVLog {
  id: string
  vehicleNumber: string
  eventType: 'ENTRY' | 'EXIT' | 'OVERSTAY_ALERT'
  confidence: number
  cameraId: string
  timestamp: string
  processed: boolean
  processingError?: string
  imageUrl?: string
  booking?: {
    id: string
    user: {
      name: string
      email: string
    }
    vehicle: {
      make: string
      model: string
      color: string
    }
    parkingSpot: {
      name: string
      address: string
    }
    status: string
  }
}

interface ActivityStats {
  totalEvents: number
  ENTRY: number
  EXIT: number
  OVERSTAY_ALERT: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export default function ActivityPage() {
  const [logs, setLogs] = useState<CVLog[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    totalEvents: 0,
    ENTRY: 0,
    EXIT: 0,
    OVERSTAY_ALERT: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [processedFilter, setProcessedFilter] = useState<string>('all')
  const [onlyBookedVehicles, setOnlyBookedVehicles] = useState(true) // Default to showing only booked vehicles

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/cv/activity?limit=50&onlyBooked=${onlyBookedVehicles}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data.logs || [])
        setStats(data.data.stats || {
          totalEvents: 0,
          ENTRY: 0,
          EXIT: 0,
          OVERSTAY_ALERT: 0
        })
      } else {
        console.error('Failed to fetch activity data')
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }, [onlyBookedVehicles])

  useEffect(() => {
    fetchActivity()
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchActivity, 10000)
    return () => clearInterval(interval)
  }, [fetchActivity]) // Re-fetch when the filter changes

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.cameraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.booking?.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesEvent = eventFilter === 'all' || log.eventType === eventFilter
    const matchesProcessed = processedFilter === 'all' || 
                            (processedFilter === 'processed' && log.processed) ||
                            (processedFilter === 'unprocessed' && !log.processed)
    
    return matchesSearch && matchesEvent && matchesProcessed
  })

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'ENTRY': return 'default'
      case 'EXIT': return 'secondary'
      case 'OVERSTAY_ALERT': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Activity</h1>
          <p className="text-muted-foreground">
            Real-time tracking of vehicle entries and exits
          </p>
        </div>
        <Button onClick={fetchActivity} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Last 50 events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ENTRY || 0}</div>
            <p className="text-xs text-muted-foreground">Vehicles entered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.EXIT || 0}</div>
            <p className="text-xs text-muted-foreground">Vehicles exited</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.OVERSTAY_ALERT || 0}</div>
            <p className="text-xs text-muted-foreground">Overstay alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Search by vehicle number, camera, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button
              variant={onlyBookedVehicles ? "default" : "outline"}
              onClick={() => setOnlyBookedVehicles(!onlyBookedVehicles)}
              className="whitespace-nowrap"
            >
              {onlyBookedVehicles ? "Booked Vehicles Only" : "Show All Vehicles"}
            </Button>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="ENTRY">Entry</SelectItem>
                <SelectItem value="EXIT">Exit</SelectItem>
                <SelectItem value="OVERSTAY_ALERT">Overstay Alert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={processedFilter} onValueChange={setProcessedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="unprocessed">Unprocessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {filteredLogs.length} of {logs.length} events shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Camera</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {log.vehicleNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEventBadgeVariant(log.eventType)}>
                        {log.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.cameraId}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {(log.confidence * 100).toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.booking ? (
                        <div className="text-sm">
                          <div className="font-medium">{log.booking.user.name}</div>
                          <div className="text-muted-foreground">{log.booking.vehicle.make} {log.booking.vehicle.model}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No booking found</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.processed ? (
                        <Badge variant="outline" className="text-green-600">
                          Processed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">
                          Pending
                        </Badge>
                      )}
                      {log.processingError && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {log.processingError}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {log.imageUrl && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {log.booking && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activity found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}