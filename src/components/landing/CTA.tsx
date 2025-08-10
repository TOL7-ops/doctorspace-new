import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to transform your healthcare experience?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of patients and healthcare providers who are already using DoctorSpace to improve their healthcare journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 h-auto">
            <Link href="/signup" aria-label="Get started with DoctorSpace">
              Get Started Free
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/login" aria-label="Login to DoctorSpace">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 