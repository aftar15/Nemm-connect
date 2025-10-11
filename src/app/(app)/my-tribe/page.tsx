'use client'

// =====================================================
// My Tribe Page - View Assigned Tribe and Members
// =====================================================

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Tribe {
  id: string
  name: string
  color: string | null
  symbol: string | null
  meaning: string | null
}

interface TribeMember {
  id: string
  full_name: string
  email: string
  role: string
  chapter: {
    id: string
    name: string
  } | null
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  tribe_id: string | null
  tribe: Tribe | null
  chapter: {
    id: string
    name: string
  } | null
}

interface MyTribeData {
  user: UserProfile
  tribe: Tribe | null
  members: TribeMember[]
}

export default function MyTribePage() {
  const [data, setData] = useState<MyTribeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTribeData()
  }, [])

  const fetchTribeData = async () => {
    try {
      const response = await fetch('/api/tribes/my-tribe')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tribe data')
      }

      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data?.tribe) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Tribe</h1>
        <Alert>
          <AlertDescription>
            You have not been assigned to a tribe yet. Tribe assignments will be announced soon!
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { tribe, members, user } = data

  // Group members by chapter
  const membersByChapter = members.reduce((acc, member) => {
    const chapterName = member.chapter?.name || 'No Chapter'
    if (!acc[chapterName]) {
      acc[chapterName] = []
    }
    acc[chapterName].push(member)
    return acc
  }, {} as Record<string, TribeMember[]>)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Tribe</h1>

      {/* Tribe Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {tribe.symbol && <span className="text-3xl">{tribe.symbol}</span>}
                Tribe of {tribe.name}
              </CardTitle>
              {tribe.meaning && (
                <CardDescription className="mt-2 text-base">
                  {tribe.meaning}
                </CardDescription>
              )}
            </div>
            {tribe.color && (
              <div 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: tribe.color }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
            </div>
            {user.chapter && (
              <Badge variant="outline">
                Your Chapter: {user.chapter.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tribe Members */}
      <Card>
        <CardHeader>
          <CardTitle>Tribe Members</CardTitle>
          <CardDescription>
            Connect with your fellow tribe members from all chapters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(membersByChapter).map(([chapterName, chapterMembers]) => (
              <div key={chapterName}>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  {chapterName} ({chapterMembers.length})
                </h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {chapterMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 border rounded-lg hover:bg-accent transition-colors ${
                        member.id === user.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {member.full_name}
                            {member.id === user.id && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          {/* Only show email for own profile */}
                          {member.id === user.id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tribe members found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">About Tribes</h3>
          <p className="text-sm text-muted-foreground">
            The 12 Tribes represent the diverse groups at the NeMM Convention. Members are
            randomly assigned from different chapters to encourage fellowship and connection.
            Throughout the convention, you'll compete together in various activities and events!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
