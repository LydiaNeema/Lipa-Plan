"use client"

import { useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export default function SpendingOverviewChart({ historyData = [], upcomingData = [] }) {
  // 🔹 Merge history (actual) and upcoming (projected) into Jan–Dec
  const data = useMemo(() => {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ]

    // Prepare a base structure
    const monthlyTotals = months.map((m) => ({
      month: m,
      amount: 0,
    }))

    // Fill in history (past payments)
    historyData.forEach((item) => {
      const monthIndex = new Date(item.date).getMonth()
      monthlyTotals[monthIndex].amount += item.amount
    })

    // Fill in upcoming (future commitments)
    upcomingData.forEach((item) => {
      const monthIndex = new Date(item.dueDate).getMonth()
      monthlyTotals[monthIndex].amount += item.amount
    })

    return monthlyTotals
  }, [historyData, upcomingData])

  // Calculate total amount for display
  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0)
  }, [data])

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value)

  // Find the maximum value for highlighting
  const maxValue = Math.max(...data.map(d => d.amount))

  const CustomBar = (props) => {
    const { x, y, width, height, payload, index } = props
    const isMax = payload.amount === maxValue && maxValue > 0
    
    // Create gradient effect - darker to lighter from left to right
    const gradientColors = [
      "#1e293b", "#334155", "#475569", "#64748b", 
      "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9",
      "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"
    ]
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isMax ? "#22c55e" : gradientColors[index]}
        rx={4}
        ry={4}
      />
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#1E3A8A]/30 via-[#1E3A8A]/20 to-[#0A1A33]/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/10">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Overview</h2>
        <p className="text-sm text-gray-300 mb-2">Avg per month</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(totalAmount / 12)}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'rgba(30, 58, 138, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              backdropFilter: 'blur(10px)'
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar 
            dataKey="amount" 
            radius={[4, 4, 0, 0]}
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}