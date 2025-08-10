import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    value: "10K+",
    label: "Active Patients",
    description: "Trusted by thousands of patients"
  },
  {
    value: "500+",
    label: "Healthcare Providers",
    description: "Qualified doctors and specialists"
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Reliable platform availability"
  },
  {
    value: "24/7",
    label: "Support",
    description: "Round-the-clock assistance"
  }
]

export function Stats() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 bg-transparent shadow-none">
              <CardContent className="p-4">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 