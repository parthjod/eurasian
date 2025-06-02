import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 py-8 max-w-3xl mx-auto">
      <section className="text-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>
            Welcome to SecureBase (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
          </p>
          <p>
            This privacy notice describes how we might use your information if you visit our website or use our services.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">2. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>
            <strong>Personal information you disclose to us:</strong> We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following: Name, Email Address, Password (hashed), Payment Information (processed by third-party).
          </p>
          <p>
            <strong>Information automatically collected:</strong> We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">3. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials (with your consent).</li>
            <li>Request feedback.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To respond to legal requests and prevent harm.</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">4. Will Your Information Be Shared With Anyone?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">5. How Long Do We Keep Your Information?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">6. How Do We Keep Your Information Safe?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>We aim to protect your personal information through a system of organizational and technical security measures.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">7. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/90">
          <p>If you have questions or comments about this notice, you may email us at privacy@securebase.example.com.</p>
        </CardContent>
      </Card>

    </div>
  );
}
