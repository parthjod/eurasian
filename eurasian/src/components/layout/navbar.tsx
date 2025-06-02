"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, ShieldCheckIcon } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-platform", label: "About Platform" },
  { href: "/support-faq", label: "Support" },
  { href: "/about-team", label: "Our Team" },
  { href: "/feedback", label: "Feedback" },
];

const authLinks = [
  { href: "/login", label: "Login", variant: "outline" as const },
  { href: "/signup", label: "Signup", variant: "default" as const },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ShieldCheckIcon className="h-8 w-8" />
          <span className="text-2xl font-headline font-semibold">SecureBase</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) =>
            link.label === "Support" ? (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => router.push(link.href)}
              >
                {link.label}
              </Button>
            ) : (
              <Button key={link.href} variant="ghost" asChild>
                <Link
                  href={link.href}
                  className="text-sm lg:text-base text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </Button>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          {authLinks.map((link) => (
            <Button key={link.href} variant={link.variant} asChild size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) =>
                  link.label === "Support" ? (
                    <Button
                      key={link.href}
                      variant="ghost"
                      onClick={() => router.push(link.href)}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  ) : (
                    <Button
                      key={link.href}
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  )
                )}
                <hr />
                {authLinks.map((link) => (
                  <Button key={link.href} variant={link.variant} asChild className="w-full">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
