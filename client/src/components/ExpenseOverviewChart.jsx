"use client"

import { useEffect, useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useAuth } from "../context/AuthContext"
import { getServices } from "../utils/api"

const COLORS = {
  Entertainment: "#3B82F6",
  Utilities: "#8B5CF6", 
  "Health & Fitness": "#EC4899",
  Transportation: "#F59E0B",
  "Food & Dining": "#22c55e",
  Shopping: "#14B8A6",
  Education: "#EF4444",
  Other: "#94a3b8"
}

export default function ExpenseOverviewChart() {
  const { token } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatCurrency = useMemo(
    () => (value) =>
      new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      }).format(value),
    []
  )

  useEffect(() => {
    const fetchServices = async () => {
      if (!token) return

      setLoading(true)
      setError(null)

      try {
        const services = await getServices(token)

        // Group services by category
        const categoryTotals = {}
        services.forEach((s) => {
          const category = s.category || "Other"
          categoryTotals[category] =
            (categoryTotals[category] || 0) + (s.monthlyCost || s.amount || 0)
        })

        // Calculate total for percentages
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

        // Format into chart data with percentages
        const chartData = Object.keys(categoryTotals).map((cat) => ({
          name: cat,
          value: categoryTotals[cat],
          percentage: total > 0 ? Math.round((categoryTotals[cat] / total) * 100) : 0
        }))

        // Sort by value descending
        chartData.sort((a, b) => b.value - a.value)

        setData(chartData)
      } catch (err) {
        console.error("Error fetching pie chart data:", err)
        setError("Failed to load chart data")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [token])

  // Calculate total amount spent
  const totalSpent = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }, [data])

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-gray-300 text-sm">Loading chart...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-red-300 text-sm">{error}</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-gray-300 text-sm">No data available</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <select className="text-sm bg-[#1E3A8A]/40 border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm cursor-pointer">
          <option className="bg-[#1E3A8A] text-white">This month</option>
          <option className="bg-[#1E3A8A] text-white">Last month</option>
          <option className="bg-[#1E3A8A] text-white">This year</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                strokeWidth={0}
                startAngle={90}
                endAngle={450}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || COLORS.Other} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-xs text-gray-300">Spent</p>
          </div>
        </div>

        {/* Legend with percentages */}
        <div className="flex-1 space-y-3 w-full">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[entry.name] || COLORS.Other }}
                />
                <span className="text-sm text-gray-200">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {entry.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}