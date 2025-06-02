import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-card shadow-t-sm mt-auto">
      <Separator />
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} SecureBase. All rights reserved.
        </p>
        <nav className="mt-2">
          <Link href="/privacy-policy" className="text-sm hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
