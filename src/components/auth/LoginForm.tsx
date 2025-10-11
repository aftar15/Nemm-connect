'use client'

// Login Form Component - Handles user authentication

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        // Fetch user profile via API route (server-side, bypasses RLS issues)
        const profileResponse = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json()
          console.error('Error fetching profile:', errorData)
          console.error('User ID:', data.user.id)
          
          setError(
            errorData.message || 
            'Your account exists but profile setup is incomplete. Please contact an administrator.'
          )
          setIsLoading(false)
          return
        }

        const { profile } = await profileResponse.json()

        // Debug logging
        console.log('User profile:', profile)
        console.log('User role:', profile?.role)

        // Role-based redirection (trim whitespace and check)
        const userRole = profile?.role?.trim()
        
        if (userRole === 'Admin') {
          router.push('/admin')
        } else if (userRole === 'Chapter Leader') {
          router.push('/chapter-leader')
        } else if (userRole === 'Committee Head') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }

        router.refresh()
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) throw resetError

      setError(null)
      alert('Password reset email sent! Please check your inbox.')
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Error sending password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          NeMM Convention Connect
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to access the convention hub
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Need an account? Contact your Chapter Leader
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

