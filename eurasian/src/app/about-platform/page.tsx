import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPlatformPage() {
  return (
    <div className="space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold font-headline mb-4">About SecureBase Platform</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the core principles, innovative technology, and unwavering commitment that define SecureBase.
        </p>
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              At SecureBase, our mission is to provide unparalleled security solutions that empower individuals and businesses to operate with confidence in an increasingly complex digital world. We believe that robust security should be accessible, elegant, and seamlessly integrated into your daily operations.
            </p>
            <p>
              We are dedicated to staying ahead of emerging threats through continuous innovation, leveraging the power of artificial intelligence and machine learning to deliver proactive and adaptive protection. Our platform is built on a foundation of trust, transparency, and a deep understanding of our clients&apos; needs.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Platform Functionality</h2>
            <div className="space-y-4 text-foreground/90">
                <p>SecureBase offers a comprehensive suite of security features designed to protect your most valuable assets:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>Advanced Threat Detection:</strong> Utilizing AI-powered algorithms to identify and neutralize threats in real-time.</li>
                    <li><strong>Data Encryption &amp; Privacy:</strong> State-of-the-art encryption protocols to ensure your data remains confidential.</li>
                    <li><strong>Secure Access Control:</strong> Granular control over user permissions and access levels.</li>
                    <li><strong>Continuous Monitoring:</strong> 24/7 surveillance of your systems to detect and respond to suspicious activity.</li>
                    <li><strong>Compliance &amp; Reporting:</strong> Tools to help you meet industry regulations and generate comprehensive security reports.</li>
                    <li><strong>User-Friendly Interface:</strong> An intuitive dashboard that makes managing your security simple and efficient.</li>
                </ul>
            </div>
        </div>
        <div className="flex justify-center">
            <Image 
                src="https://placehold.co/500x350.png" 
                alt="Secure Platform Interface" 
                width={500} 
                height={350} 
                className="rounded-lg shadow-xl"
                data-ai-hint="technology security"
            />
        </div>
      </section>

      <section>
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Why Choose SecureBase?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Choosing SecureBase means investing in peace of mind. Our platform is more than just software; it&apos;s a commitment to your security. We combine sophisticated technology with a human-centric approach, ensuring that you receive not only the best protection but also the support and guidance you need.
            </p>
            <ul className="list-disc list-inside space-y-1">
                <li>Proactive defense mechanisms</li>
                <li>Scalable solutions for growing needs</li>
                <li>Expert support team</li>
                <li>Commitment to ethical practices</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
