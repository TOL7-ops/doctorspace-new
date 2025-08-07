"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DoctorCard } from '@/components/DoctorCard'
import { WelcomeText } from '@/components/WelcomeText'
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  qualification?: string
  years_of_experience?: number
  available_days?: string[]
  available_hours?: string[]
  image_url?: string
  rating?: number
  location?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .limit(10)

      if (error) {
        console.error('Error fetching doctors:', error)
        return
      }

      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/appointments/doctor/${doctorId}`)
  }

  const nextSlide = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  const prevSlide = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const [canGoNext, setCanGoNext] = useState(true)
  const [canGoPrev, setCanGoPrev] = useState(false)

  // Check scroll position to enable/disable navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanGoPrev(scrollLeft > 0)
      setCanGoNext(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      checkScrollPosition() // Check initial position
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [doctors.length])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <section className="space-y-4">
          <WelcomeText 
            text="WELCOME TO DOCTORSPACE"
            className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
          />
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find and book appointments with qualified healthcare professionals in your area.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : doctors.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available specialists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-20" /> : "Tomorrow"}
              </div>
              <p className="text-xs text-muted-foreground">
                Dr. Smith - 10:00 AM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : "8"}
              </div>
              <p className="text-xs text-muted-foreground">
                Time slots available
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Available Doctors Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Available Doctors</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                disabled={!canGoPrev}
                aria-label="Previous doctors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                disabled={!canGoNext}
                aria-label="Next doctors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Doctors Horizontal Swiper */}
          <div className="relative">
            <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80">
                    <DoctorCard
                      doctor={{} as Doctor}
                      onBookAppointment={() => {}}
                      loading={true}
                    />
                  </div>
                ))
              ) : doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="flex-shrink-0 w-80">
                    <DoctorCard
                      doctor={doctor}
                      onBookAppointment={handleBookAppointment}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12">
                  <div className="space-y-4">
                    <User className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground">No doctors available</h3>
                    <p className="text-muted-foreground">
                      Check back later for available appointments.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Healthcare Services</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Video Consultation clicked')
                // Implement video consultation functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Video Consultation</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Pharmacy clicked')
                // Implement pharmacy functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Pharmacy</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Lab Tests clicked')
                // Implement lab tests functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Lab Tests</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Emergency Care clicked')
                // Implement emergency care functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Emergency Care</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Mental Health clicked')
                // Implement mental health functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Mental Health</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => {
                console.log('Physical Therapy clicked')
                // Implement physical therapy functionality
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Physical Therapy</span>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
} 