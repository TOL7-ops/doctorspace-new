import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    avatar: "/placeholder-doctor.jpg",
    content: "DoctorSpace has completely transformed how I manage my healthcare. Booking appointments is so easy, and I love being able to message my doctor directly.",
    rating: 5
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    avatar: "/placeholder-doctor.jpg",
    content: "As a healthcare provider, DoctorSpace has streamlined my practice. The platform makes it easy to coordinate with patients and other specialists.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    avatar: "/placeholder-doctor.jpg",
    content: "The mobile app is fantastic. I can check my appointments, message my care team, and access my health records from anywhere.",
    rating: 5
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our users say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who trust DoctorSpace for their healthcare needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 