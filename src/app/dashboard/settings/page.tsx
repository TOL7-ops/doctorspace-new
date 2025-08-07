'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { User, Mail, Phone, Calendar, Bell, Moon, Edit, Save, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  created_at: string
  patients?: {
    full_name?: string
    phone_number?: string
  }
}

interface UserPreferences {
  notifications: boolean
  emailReminders: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    emailReminders: true,
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError || !currentUser) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('patients')
          .select('full_name, phone_number')
          .eq('id', currentUser.id)
          .single()

        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          created_at: currentUser.created_at,
          patients: profile,
        })

        setEditForm({
          full_name: profile?.full_name || '',
          phone_number: profile?.phone_number || '',
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`)
  }

  const handleThemeChange = (enabled: boolean) => {
    setTheme(enabled ? 'dark' : 'light')
    toast.success(`${enabled ? 'Dark' : 'Light'} mode enabled`)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('patients')
        .upsert({
          id: user.id,
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
        })

      if (error) throw error

      setUser(prev => prev ? {
        ...prev,
        patients: {
          ...prev.patients,
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
        }
      } : null)

      setEditDialogOpen(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </div>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you are done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="full_name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone_number" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone_number"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Full Name</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {user.patients?.full_name || 'Not provided'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {user.patients?.phone_number || 'Not provided'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive appointment reminders and updates
                </p>
              </div>
              <Switch 
                checked={preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Reminders</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get email notifications for appointments
                </p>
              </div>
              <Switch 
                checked={preferences.emailReminders}
                onCheckedChange={(checked) => handlePreferenceChange('emailReminders', checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Verification</span>
              <Badge variant="default">Verified</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Type</span>
              <Badge variant="secondary">Patient</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-muted-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" disabled>
              Change Password
              <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Two-Factor Authentication
              <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Privacy Settings
              <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 