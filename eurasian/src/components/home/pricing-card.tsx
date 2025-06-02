import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  pricePeriod?: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

export default function PricingCard({ title, description, price, pricePeriod = "/ month", features, buttonText, highlighted = false }: PricingCardProps) {
  return (
    <Card className={`flex flex-col ${highlighted ? 'border-primary shadow-lg scale-105' : 'shadow-md'}`}>
      <CardHeader className="pb-4">
        <CardTitle className={`font-headline text-2xl ${highlighted ? 'text-primary' : ''}`}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-4xl font-bold font-headline">{price}</span>
          <span className="text-muted-foreground">{pricePeriod}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckIcon className={`h-5 w-5 mr-2 ${highlighted ? 'text-primary' : 'text-green-500'}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={highlighted ? 'default' : 'outline'}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
