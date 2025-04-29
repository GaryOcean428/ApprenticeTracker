import PublicLayout from "@/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ServicesPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Our Services
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Comprehensive apprenticeship and traineeship management services for both apprentices and host employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apprenticeship & Traineeship Management */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                Core Service
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Apprenticeship & Traineeship Management
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                Braden Group offers complete end-to-end management of your apprenticeship or traineeship journey, 
                handling all aspects from recruitment to completion.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Recruitment and selection of quality apprentices</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Matching apprentices with suitable host employers</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Rotation of apprentices to ensure diverse skill development</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Regular site visits and progress monitoring</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Support through the entire apprenticeship lifecycle</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/find-apprenticeship">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Find an Apprenticeship
                  </Button>
                </Link>
                <Link href="/host-apprentice">
                  <Button variant="outline">
                    Become a Host Employer
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg overflow-hidden bg-gray-100 w-full aspect-video flex items-center justify-center text-gray-500">
                [Apprentice & Host Employer Image]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payroll Processing & Compliance */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex items-center justify-center order-last lg:order-first">
              <div className="rounded-lg overflow-hidden bg-gray-100 w-full aspect-video flex items-center justify-center text-gray-500">
                [Payroll & Compliance Image]
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                Administrative Support
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Payroll Processing & Compliance Support
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                We handle all administrative aspects of employing apprentices, ensuring compliance with regulations 
                and taking the burden off both apprentices and host employers.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Weekly or fortnightly payroll processing</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Award rate compliance and wage management</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Workers' compensation and insurance coverage</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Superannuation and tax management</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Leave entitlement management and tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment & Workforce Solutions */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                Talent Solutions
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Recruitment & Workforce Solutions
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                Beyond apprenticeships, Braden Group provides comprehensive workforce solutions to help 
                businesses find the right talent and manage their workforce efficiently.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Specialized recruitment for trades and technical positions</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Workforce planning and skills gap analysis</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Temporary and contract staffing solutions</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Pre-employment screening and verification</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg overflow-hidden bg-gray-100 w-full aspect-video flex items-center justify-center text-gray-500">
                [Recruitment & Workforce Image]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing & Subsidy Assistance */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex items-center justify-center order-last lg:order-first">
              <div className="rounded-lg overflow-hidden bg-gray-100 w-full aspect-video flex items-center justify-center text-gray-500">
                [Financing & Subsidies Image]
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                Financial Support
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Financing & Subsidy Assistance
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                We help both apprentices and host employers access available government incentives, 
                subsidies, and financial support to make apprenticeships more accessible and affordable.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Identification of eligible government incentives</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Application assistance for funding programs</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Payroll tax exemption guidance</span>
                </li>
                <li className="flex items-center">
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
                    className="h-5 w-5 mr-2 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Cost-benefit analysis for host employers</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Inquire About Subsidies
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to partner with Braden Group?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Contact us today to discuss how we can support your apprenticeship or workforce needs.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
