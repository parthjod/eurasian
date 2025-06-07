"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MenuIcon, ShieldCheckIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-platform", label: "About Platform" },
  { href: "/support-faq", label: "Support" },
  { href: "/about-team", label: "Our Team" },
  { href: "/feedback", label: "Feedback" },
]

export default function Navbar() {
  const router = useRouter()

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ShieldCheckIcon className="h-8 w-8" />
          <span className="text-2xl font-headline font-semibold">SecureBase</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) =>
            link.label === "Support" ? (
              <Button key={link.href} variant="ghost" onClick={() => router.push(link.href)}>
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

        {/* Desktop auth dropdowns */}
        <div className="hidden md:flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Login
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/login")}>
                Login with&nbsp;Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/login/face")}>
                Login with&nbsp;Face
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                Signup
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/signup")}>
                Signup with&nbsp;Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/signup/face")}>
                Signup with&nbsp;Face
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              {/* hidden title for a11y */}
              <SheetTitle asChild>
                <VisuallyHidden>Navigation Menu</VisuallyHidden>
              </SheetTitle>

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
                {/* Mobile auth links */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/login")}
                >
                  Login&nbsp;-&nbsp;Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/login/face")}
                >
                  Login&nbsp;-&nbsp;Face
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => router.push("/signup")}
                >
                  Signup&nbsp;-&nbsp;Email
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => router.push("/signup/face")}
                >
                  Signup&nbsp;-&nbsp;Face
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
