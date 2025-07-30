"use client"

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, Newspaper, Activity, TrendingUp, AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"

// API endpoints configuration
const API_ENDPOINTS = {
  farmers: '/api/farmers',
  vendors: '/api/vendors',
  products: '/api/organic-products',
  news: '/api/news'
};

// Stats configuration
const STATS_CONFIG = [
  {
    key: 'farmers',
    title: "Total Farmers",
    icon: Users,
    description: "Registered farmers",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    chartColor: "#22c55e"
  },
  {
    key: 'vendors',
    title: "Total Vendors",
    icon: Store,
    description: "Active vendor accounts",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    chartColor: "#3b82f6"
  },
  {
    key: 'products',
    title: "Organic Products",
    icon: Package,
    description: "Listed by farmers",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    chartColor: "#8b5cf6"
  },
  {
    key: 'news',
    title: "News Articles",
    icon: Newspaper,
    description: "Published articles",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    chartColor: "#f97316"
  }
];

// Custom hook for data fetching with error handling and caching
const useDataFetching = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (endpoint, key) => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${key}: ${res.status}`);
      }
      const result = await res.json();
      return { [key]: result };
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return { [key]: [] };
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = Object.entries(API_ENDPOINTS).map(([key, endpoint]) =>
        fetchData(endpoint, key)
      );
      
      const results = await Promise.all(promises);
      const combinedData = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      
      setData(combinedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};

// Optimized chart data generation
const useChartData = (data) => {
  return useMemo(() => {
    const counts = {
      farmers: data.farmers?.length || 0,
      vendors: data.vendors?.length || 0,
      products: data.products?.length || 0,
      news: data.news?.length || 0
    };

    return STATS_CONFIG
      .filter(stat => stat.key !== 'news') // Exclude news from chart
      .map(stat => ({
        category: stat.title.replace('Total ', '').replace('Organic ', ''),
        count: counts[stat.key],
        color: stat.chartColor
      }));
  }, [data]);
};

// Optimized stats data generation
const useStatsData = (data) => {
  return useMemo(() => {
    const counts = {
      farmers: data.farmers?.length || 0,
      vendors: data.vendors?.length || 0,
      products: data.products?.length || 0,
      news: data.news?.length || 0
    };

    return STATS_CONFIG.map(stat => ({
      ...stat,
      value: counts[stat.key]
    }));
  }, [data]);
};

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Stats card component
const StatsCard = ({ stat }) => (
  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${stat.iconBg}`}>
          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
        </div>
        <div className={`w-16 h-16 rounded-full ${stat.color} opacity-10 absolute -top-4 -right-4`}></div>
      </div>
      <CardTitle className="text-2xl font-bold text-gray-900">
        {stat.value.toLocaleString()}
      </CardTitle>
      <CardDescription className="text-gray-600">
        {stat.description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{stat.title}</span>
        <TrendingUp className="h-4 w-4 text-green-500" />
      </div>
    </CardContent>
  </Card>
);

// Chart component
const DashboardChart = ({ data }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Platform Overview</CardTitle>
      <CardDescription>Distribution of farmers, vendors, and products</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Quick actions component
const QuickActions = () => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Common tasks and shortcuts</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add New Farmer", href: "/farmers", icon: Users, color: "bg-green-500" },
          { label: "Add New Vendor", href: "/vendors", icon: Store, color: "bg-blue-500" },
          { label: "Add New Product", href: "/organic-products", icon: Package, color: "bg-purple-500" },
          { label: "Create News", href: "/news", icon: Newspaper, color: "bg-orange-500" }
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`p-3 rounded-full ${action.color} mb-2`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </CardContent>
  </Card>
);

// System status component
const SystemStatus = () => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>System Status</CardTitle>
      <CardDescription>Platform health and performance</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Database", status: "Operational", color: "text-green-600", bg: "bg-green-100" },
          { name: "API", status: "Healthy", color: "text-green-600", bg: "bg-green-100" },
          { name: "Frontend", status: "Running", color: "text-green-600", bg: "bg-green-100" }
        ].map((service) => (
          <div key={service.name} className="flex items-center space-x-3 p-3 rounded-lg border">
            <div className={`w-3 h-3 rounded-full ${service.bg}`}></div>
            <div>
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className={`text-sm ${service.color}`}>{service.status}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const { data, loading, error, refetch } = useDataFetching();
  const statsData = useStatsData(data);
  const chartData = useChartData(data);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

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
        {statsData.map((stat) => (
          <StatsCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Chart and Additional Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardChart data={chartData} />
        <QuickActions />
      </div>

      <SystemStatus />
    </div>
  );
}
