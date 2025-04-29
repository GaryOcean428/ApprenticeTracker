import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/public-layout";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Connecting apprentices with career opportunities, and employers with skilled talent.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Group Training Organisation specialising in apprenticeship and traineeship management in Western Australia.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/find-apprenticeship">
                <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
                  Find an Apprenticeship
                </Button>
              </Link>
              <Link href="/host-apprentice">
                <Button variant="outline" size="lg">
                  Become a Host Employer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-center text-sm text-gray-500">Apprentices Placed</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-center text-sm text-gray-500">Host Employers</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-center text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-center text-sm text-gray-500">Industries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                What Our Clients Say
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from our apprentices and host employers about their experience working with Braden Group.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                  <div className="flex flex-row items-start gap-4">
                    <div className="rounded-full border border-blue-500 p-1">
                      <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
                        A
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Alex Thompson</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Electrical Apprentice</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-gray-200 pl-4 italic">
                    "Braden Group made it easy to find an apprenticeship that matched my skills and interests. The support I've received has been amazing."
                  </blockquote>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                  <div className="flex flex-row items-start gap-4">
                    <div className="rounded-full border border-blue-500 p-1">
                      <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
                        S
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Sarah Johnson</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Host Employer - Johnson Construction</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-gray-200 pl-4 italic">
                    "Working with Braden Group has removed the administrative burden of managing apprentices while giving us access to top talent."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whether you're looking for an apprenticeship or want to host an apprentice, we're here to help.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Contact Us Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
