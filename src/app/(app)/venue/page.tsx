import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Route, 
  Phone, 
  Building, 
  Bus,
  AlertCircle,
  Info
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, any> = {
  building: Building,
  route: Route,
  phone: Phone,
  bath: Building,
  bus: Bus,
  alert: AlertCircle,
  info: Info,
}

// Category colors
const categoryColors: Record<string, string> = {
  'General': 'bg-blue-500',
  'Parade Route': 'bg-purple-500',
  'Emergency': 'bg-red-500',
  'Facilities': 'bg-green-500',
  'Transportation': 'bg-orange-500',
}

export default async function VenuePage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch venue information
  const { data: venueInfo } = await supabase
    .from('venue_info')
    .select('*')
    .eq('is_visible', true)
    .order('display_order')

  // Group by category
  const infoByCategory = (venueInfo || []).reduce((acc, info) => {
    if (!acc[info.category]) {
      acc[info.category] = []
    }
    acc[info.category].push(info)
    return acc
  }, {} as Record<string, typeof venueInfo>)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Venue Information
        </h1>
        <p className="text-muted-foreground">
          Essential logistics and location details for the convention
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(infoByCategory).map(([category, items]) => (
          <div key={category}>
            <div className="mb-3">
              <Badge 
                className={`${categoryColors[category] || 'bg-gray-500'} text-white`}
              >
                {category}
              </Badge>
            </div>
            <div className="space-y-3">
              {items!.map((item) => {
                const IconComponent = item.icon ? iconMap[item.icon] || Info : Info
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <IconComponent className="h-5 w-5" />
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {item.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {venueInfo && venueInfo.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Venue information will be available soon
            </p>
          </CardContent>
        </Card>
      )}

      {/* General Info Card */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Important Note
          </h3>
          <p className="text-sm text-muted-foreground">
            Please review all venue information carefully. For safety and security, 
            familiarize yourself with emergency contacts and evacuation routes. 
            If you have questions, contact the appropriate committee head from the Directory.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

