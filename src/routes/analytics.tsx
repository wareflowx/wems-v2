import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const Route = createFileRoute('/analytics')({
  component: Analytics,
})

function Analytics() {
  const monthlyData = [
    { month: 'Jan', revenue: 45000, users: 1200, sessions: 4500 },
    { month: 'Feb', revenue: 52000, users: 1450, sessions: 5200 },
    { month: 'Mar', revenue: 48000, users: 1320, sessions: 4800 },
    { month: 'Apr', revenue: 61000, users: 1680, sessions: 6100 },
    { month: 'May', revenue: 55000, users: 1520, sessions: 5500 },
    { month: 'Jun', revenue: 67000, users: 1890, sessions: 6700 },
  ]

  const topPages = [
    { page: '/dashboard', views: 12450, change: 12.5 },
    { page: '/users', views: 8320, change: 8.2 },
    { page: '/settings', views: 5670, change: -3.1 },
    { page: '/analytics', views: 4520, change: 15.7 },
    { page: '/', views: 12340, change: 5.4 },
  ]

  const devices = [
    { device: 'Desktop', percentage: 65, users: 45678 },
    { device: 'Mobile', percentage: 28, users: 19678 },
    { device: 'Tablet', percentage: 7, users: 4920 },
  ]

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-500'
    if (value < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your application performance and user engagement.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$328,000</div>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(23.5)}
                  <span className={`text-sm font-medium ${getTrendColor(23.5)}`}>
                    +23.5%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    from previous period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">9,060</div>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(18.2)}
                  <span className={`text-sm font-medium ${getTrendColor(18.2)}`}>
                    +18.2%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    from previous period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Session</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5m 32s</div>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(-2.4)}
                  <span className={`text-sm font-medium ${getTrendColor(-2.4)}`}>
                    -2.4%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue breakdown over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <span className="text-sm font-bold">
                        ${data.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${(data.revenue / 70000) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <div>Users: {data.users.toLocaleString()}</div>
                      <div>Sessions: {data.sessions.toLocaleString()}</div>
                      <div>ARPU: ${(data.revenue / data.users).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages in your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="font-medium">{page.page}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {page.views.toLocaleString()} views
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(page.change)}
                      <span className={`text-sm font-medium ${getTrendColor(page.change)}`}>
                        {page.change > 0 ? '+' : ''}{page.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>User distribution across different devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {devices.map((device) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{device.device}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {device.users.toLocaleString()} users
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                      {device.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
