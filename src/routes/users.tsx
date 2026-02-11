import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/users')({
  component: Users,
})

const usersData = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'Admin',
    status: 'Active',
    location: 'San Francisco, CA',
    avatar: '/avatars/01.png',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'Developer',
    status: 'Active',
    location: 'New York, NY',
    avatar: '/avatars/02.png',
  },
  {
    id: 3,
    name: 'Carol Williams',
    email: 'carol.williams@example.com',
    role: 'Designer',
    status: 'Inactive',
    location: 'Los Angeles, CA',
    avatar: '/avatars/03.png',
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'Developer',
    status: 'Active',
    location: 'Seattle, WA',
    avatar: '/avatars/04.png',
  },
  {
    id: 5,
    name: 'Eve Davis',
    email: 'eve.davis@example.com',
    role: 'Manager',
    status: 'Active',
    location: 'Austin, TX',
    avatar: '/avatars/05.png',
  },
  {
    id: 6,
    name: 'Frank Miller',
    email: 'frank.miller@example.com',
    role: 'Developer',
    status: 'Pending',
    location: 'Chicago, IL',
    avatar: '/avatars/06.png',
  },
  {
    id: 7,
    name: 'Grace Lee',
    email: 'grace.lee@example.com',
    role: 'Designer',
    status: 'Active',
    location: 'Portland, OR',
    avatar: '/avatars/07.png',
  },
  {
    id: 8,
    name: 'Henry Wilson',
    email: 'henry.wilson@example.com',
    role: 'Developer',
    status: 'Inactive',
    location: 'Boston, MA',
    avatar: '/avatars/08.png',
  },
]

function Users() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = usersData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your team members and their account permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {usersData.length} total users in your organization
              </CardDescription>
            </div>
            <Button>Add User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'Active'
                            ? 'default'
                            : user.status === 'Inactive'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      {user.location}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No users found matching "{searchQuery}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
