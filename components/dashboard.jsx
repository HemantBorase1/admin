"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, Newspaper, Activity, TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"

async function fetchFarmers() {
  try {
    const res = await fetch('/api/farmers');
    if (!res.ok) {
      console.error('Failed to fetch farmers:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return [];
  }
}
async function fetchVendors() {
  try {
    const res = await fetch('/api/vendors');
    if (!res.ok) {
      console.error('Failed to fetch vendors:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}
async function fetchProducts() {
  try {
    const res = await fetch('/api/organic-products');
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
async function fetchNews() {
  try {
    const res = await fetch('/api/news');
    if (!res.ok) {
      console.error('Failed to fetch news:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

const statsData = [
  {
    title: "Total Farmers",
    value: 0,
    icon: Users,
    description: "Registered farmers",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Total Vendors",
    value: 0,
    icon: Store,
    description: "Active vendor accounts",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Organic Products",
    value: 0,
    icon: Package,
    description: "Listed by farmers",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "News Articles",
    value: 0,
    icon: Newspaper,
    description: "Published articles",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
]

const chartData = [
  { month: "Jan", farmers: 120, vendors: 8, products: 45 },
  { month: "Feb", farmers: 150, vendors: 12, products: 67 },
  { month: "Mar", farmers: 180, vendors: 15, products: 89 },
  { month: "Apr", farmers: 220, vendors: 18, products: 123 },
  { month: "May", farmers: 280, vendors: 22, products: 156 },
  { month: "Jun", farmers: 320, vendors: 25, products: 189 },
]

export function Dashboard() {
  const [farmersCount, setFarmersCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);

  useEffect(() => {
    fetchFarmers().then(data => setFarmersCount(data.length));
    fetchVendors().then(data => setVendorsCount(data.length));
    fetchProducts().then(data => setProductsCount(data.length));
    fetchNews().then(data => setNewsCount(data.length));
  }, []);

  const liveStatsData = [
    {
      title: "Total Farmers",
      value: farmersCount,
      icon: Users,
      description: "Registered farmers",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Vendors",
      value: vendorsCount,
      icon: Store,
      description: "Active vendor accounts",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Organic Products",
      value: productsCount,
      icon: Package,
      description: "Listed by farmers",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "News Articles",
      value: newsCount,
      icon: Newspaper,
      description: "Published articles",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  // Prepare chart data for a single bar per category using live counts
  const summaryChartData = [
    { category: "Farmers", count: farmersCount, color: "#22c55e" },
    { category: "Vendors", count: vendorsCount, color: "#3b82f6" },
    { category: "Products", count: productsCount, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-green-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Monitor and manage your agricultural platform with comprehensive insights and real-time data
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">System Status</p>
              <p className="text-xs text-gray-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {liveStatsData.map((stat, index) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full w-3/4 ${stat.color} rounded-full`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Growth Chart */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Platform Growth Analytics</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Track current totals across all platform categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={summaryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 14, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 14, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [value, "Count"]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {summaryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activity */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">Recent Platform Activity</CardTitle>
          <CardDescription className="text-gray-600">Latest updates and activities across the platform</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[
              {
                action: "New farmer registration",
                user: "Rajesh Kumar",
                time: "2 minutes ago",
                type: "farmer",
                description: "Registered from Punjab with wheat farming experience",
              },
              {
                action: "Organic product added",
                user: "Priya Sharma",
                time: "15 minutes ago",
                type: "product",
                description: "Added organic tomatoes to the marketplace",
              },
              {
                action: "New banner created",
                user: "Admin",
                time: "2 hours ago",
                type: "banner",
                description: "Summer crop protection campaign banner",
              },
              {
                action: "Vendor account updated",
                user: "Green Seeds Co.",
                time: "3 hours ago",
                type: "vendor",
                description: "Updated product catalog and pricing",
              },
              {
                action: "News article published",
                user: "Admin",
                time: "4 hours ago",
                type: "news",
                description: "Agricultural subsidy scheme announcement",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === "farmer"
                      ? "bg-green-500"
                      : activity.type === "vendor"
                        ? "bg-blue-500"
                        : activity.type === "banner"
                          ? "bg-purple-500"
                          : activity.type === "product"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{activity.action}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{activity.user}</span>
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
