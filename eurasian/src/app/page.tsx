import PricingCard from "@/components/home/pricing-card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const pricingPlans = [
    {
      title: "Basic Security",
      description: "Essential protection for individuals.",
      price: "$10",
      features: ["Basic Threat Detection", "Limited Support", "1 User Account"],
      buttonText: "Get Started",
    },
    {
      title: "Pro Security",
      description: "Advanced protection for small teams.",
      price: "$25",
      features: ["Advanced Threat Detection", "Priority Support", "5 User Accounts", "Weekly Reports"],
      buttonText: "Choose Pro",
      highlighted: true,
    },
    {
      title: "Enterprise Security",
      description: "Comprehensive security for large organizations.",
      price: "$50",
      features: ["Full Suite Threat Protection", "24/7 Dedicated Support", "Unlimited Users", "Custom Integrations"],
      buttonText: "Contact Us",
    },
  ];

  return (
    <div className="space-y-16 py-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
          Welcome to <span className="text-primary">SecureBase</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Your trusted partner in providing top-notch security solutions. We leverage cutting-edge technology to protect your digital assets with elegance and precision.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Secure Your Assets Today</Link>
        </Button>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline text-center mb-10">Our Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold font-headline mb-10">Meet Our Guardians</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Our advanced AI bots work tirelessly to ensure your safety and peace of mind.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Image
                src={`https://placehold.co/300x300.png`}
                alt={`Guardian Bot ${i}`}
                width={300}
                height={300}
                className="rounded-md mx-auto mb-4"
                data-ai-hint="robot technology"
              />
              <h3 className="text-xl font-semibold font-headline mb-2">Guardian Bot v{i}.0</h3>
              <p className="text-sm text-muted-foreground">State-of-the-art autonomous security unit.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
