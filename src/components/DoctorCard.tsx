"use client"

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, Star } from 'lucide-react'

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

interface DoctorCardProps {
  doctor: Doctor
  onBookAppointment: (doctorId: string) => void
  loading?: boolean
}

export function DoctorCard({ doctor, onBookAppointment, loading = false }: DoctorCardProps) {
  const router = useRouter()

  const handleDoctorClick = () => {
    router.push(`/appointments/doctor/${doctor.id}`)
  }
  if (loading) {
    return (
      <Card className="w-full max-w-sm md:max-w-md lg:max-w-md min-h-[260px] transition-all duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group w-full max-w-sm md:max-w-md lg:max-w-md min-h-[260px] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div 
            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleDoctorClick}
          >
            {doctor.image_url ? (
              <Image
                src={doctor.image_url}
                alt={`Dr. ${doctor.full_name}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <span className="text-lg font-semibold">
                  {doctor.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={handleDoctorClick}
            >
              Dr. {doctor.full_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {doctor.specialization}
            </p>
            {doctor.qualification && (
              <p className="text-xs text-muted-foreground truncate">
                {doctor.qualification}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {doctor.years_of_experience && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{doctor.years_of_experience} years experience</span>
            </div>
          )}
          
          {doctor.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="truncate">{doctor.location}</span>
            </div>
          )}

          {doctor.rating && (
            <div className="flex items-center text-sm">
              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-muted-foreground">{doctor.rating}/5</span>
            </div>
          )}
        </div>

        {doctor.available_days && doctor.available_days.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Available:</p>
            <div className="flex flex-wrap gap-1">
              {doctor.available_days.slice(0, 3).map((day, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  {day}
                </span>
              ))}
              {doctor.available_days.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{doctor.available_days.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => onBookAppointment(doctor.id)}
          className="w-full"
          aria-label={`Book appointment with Dr. ${doctor.full_name}`}
        >
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  )
} 