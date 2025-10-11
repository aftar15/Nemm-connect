// Admin Users Page - Manage All Users

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateUserDialog from '@/components/features/users/CreateUserDialog'
import UserList from '@/components/features/users/UserList'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage all users in the system.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users including admins, chapter leaders, committee heads, and attendees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList />
        </CardContent>
      </Card>
    </div>
  )
}

