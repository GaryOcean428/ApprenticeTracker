import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Braden Group</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  Home
                </span>
              </Link>
              <Link href="/about">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  About
                </span>
              </Link>
              <Link href="/services">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  Services
                </span>
              </Link>
              <Link href="/find-apprenticeship">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  Find Apprenticeship
                </span>
              </Link>
              <Link href="/host-apprentice">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  Host an Apprentice
                </span>
              </Link>
              <Link href="/contact">
                <span className="flex items-center text-lg font-medium transition-colors hover:text-blue-500">
                  Contact
                </span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Portal Access</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-gray-100">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Braden Group</h3>
              <p className="max-w-xs text-sm text-gray-500">
                Connecting apprentices and employers for successful careers and business growth in Western Australia.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Services</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Apprenticeship Management
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Host Employer Services
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Recruitment Solutions
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Compliance Support
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Apprenticeships</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Current Opportunities
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Types of Apprenticeships
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      How to Apply
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Eligibility Requirements
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      News
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-500">
                    123 Business Street
                    <br />
                    Perth, WA 6000
                  </li>
                  <li className="text-gray-500">
                    info@bradengroup.com.au
                  </li>
                  <li className="text-gray-500">
                    (08) 9123 4567
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Braden Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
