import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Users } from 'lucide-react'

export default async function DirectoryPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch committee members
  const { data: committeeMembers } = await supabase
    .from('committee_members')
    .select('*')
    .eq('is_visible', true)
    .order('display_order')

  // Group by committee
  const committeesByGroup = (committeeMembers || []).reduce((acc, member) => {
    if (!acc[member.committee]) {
      acc[member.committee] = []
    }
    acc[member.committee].push(member)
    return acc
  }, {} as Record<string, typeof committeeMembers>)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Committee Directory</h1>
        <p className="text-muted-foreground">
          Key committee heads and their contact information
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(committeesByGroup).map(([committee, members]) => (
          <Card key={committee}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {committee}
              </CardTitle>
              <CardDescription>
                {members!.length} {members!.length === 1 ? 'member' : 'members'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members!.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    {member.photo_url && (
                      <div className="mb-3">
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="w-16 h-16 rounded-full object-cover mx-auto"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="font-semibold">{member.full_name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {member.position}
                      </Badge>
                      {member.email && (
                        <div className="flex items-center justify-center gap-1 mt-3 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:underline truncate"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:underline"
                          >
                            {member.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {committeeMembers && committeeMembers.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Committee directory information will be available soon
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">About the Directory</h3>
          <p className="text-sm text-muted-foreground">
            This directory provides contact information for key committee heads during the convention.
            For general inquiries or emergencies, please reach out to the appropriate committee head.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
