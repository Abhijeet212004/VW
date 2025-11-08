"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const BACKEND_URL = 'http://localhost:3000'

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Real data from your parking system</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Live Data
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-gray-600">Total Vehicles</h3>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-gray-600">Active Bookings</h3>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-gray-600">Total Users</h3>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-gray-600">Today's Revenue</h3>
            <p className="text-2xl font-bold">₹20</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">MH12QB2053</p>
                <p className="text-sm text-gray-500">Test User</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Checked In</p>
                <p className="text-sm text-gray-500">PICT Pune Smart Parking</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">30 minutes ago</p>
                <Badge variant="default">active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
