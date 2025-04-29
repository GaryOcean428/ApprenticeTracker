import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 md:flex">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <span className="font-bold text-xl">Braden Group</span>
              </a>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="/">
                <a className="text-sm font-medium transition-colors hover:text-primary">Home</a>
              </Link>
              <Link href="/about">
                <a className="text-sm font-medium transition-colors hover:text-primary">About Us</a>
              </Link>
              <Link href="/services">
                <a className="text-sm font-medium transition-colors hover:text-primary">Services</a>
              </Link>
              <Link href="/find-apprenticeship">
                <a className="text-sm font-medium transition-colors hover:text-primary">Find an Apprenticeship</a>
              </Link>
              <Link href="/host-apprentice">
                <a className="text-sm font-medium transition-colors hover:text-primary">Host an Apprentice</a>
              </Link>
              <Link href="/contact">
                <a className="text-sm font-medium transition-colors hover:text-primary">Contact Us</a>
              </Link>
            </nav>
            <Button variant="default" className="ml-auto hidden md:flex">
              <Link href="/contact">
                <a className="text-white">Get Started</a>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <span className="font-bold">Braden Group</span>
              </a>
            </Link>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Braden Group. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy">
              <a className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
