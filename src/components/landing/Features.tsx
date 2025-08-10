import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Shield, Users, Clock, Smartphone } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Easy Appointment Booking",
    description: "Schedule appointments with healthcare providers in just a few clicks"
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "Communicate directly with your healthcare team through encrypted messages"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Your health information is protected with enterprise-grade security"
  },
  {
    icon: Users,
    title: "Care Team Collaboration",
    description: "Connect with specialists and coordinate care seamlessly"
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Access your health records and schedule appointments anytime"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Optimized for mobile devices with a responsive design"
  }
]

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for modern healthcare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DoctorSpace provides a comprehensive platform for patients and healthcare providers to connect, communicate, and coordinate care effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 