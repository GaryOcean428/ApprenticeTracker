import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/public-layout";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                <span className="text-braden-sky">Connecting apprentices with career opportunities, and employers with skilled talent.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-braden-navy md:text-xl">
                Group Training Organisation specialising in apprenticeship and traineeship management in Western Australia.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/find-apprenticeship">
                <Button className="bg-braden-sky hover:bg-blue-600 text-white font-semibold px-6 py-3" size="lg">
                  Find an Apprenticeship
                </Button>
              </Link>
              <Link href="/host-apprentice">
                <Button variant="outline" size="lg" className="border-2 border-braden-navy bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-3">
                  Become a Host Employer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 border-2 border-braden-sky rounded-lg p-6 shadow-md">
              <div className="text-4xl font-bold text-braden-navy">100+</div>
              <div className="text-center text-sm text-braden-navy font-medium">Apprentices Placed</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-2 border-braden-sky rounded-lg p-6 shadow-md">
              <div className="text-4xl font-bold text-braden-navy">50+</div>
              <div className="text-center text-sm text-braden-navy font-medium">Host Employers</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-2 border-braden-sky rounded-lg p-6 shadow-md">
              <div className="text-4xl font-bold text-braden-navy">95%</div>
              <div className="text-center text-sm text-braden-navy font-medium">Completion Rate</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-2 border-braden-sky rounded-lg p-6 shadow-md">
              <div className="text-4xl font-bold text-braden-navy">15+</div>
              <div className="text-center text-sm text-braden-navy font-medium">Industries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-braden-navy">
                What Our Clients Say
              </h2>
              <p className="mx-auto max-w-[700px] text-braden-navy md:text-xl">
                Hear from our apprentices and host employers about their experience working with Braden Group.
              </p>
            </div>
            <div className="w-full grid gap-6 py-8 md:grid-cols-2 lg:gap-10 max-w-5xl">
              <div className="flex flex-col justify-center space-y-4">
                <div className="relative overflow-hidden rounded-lg border-2 border-braden-sky bg-white p-6 shadow-md">
                  <div className="flex flex-row items-start gap-4">
                    <div className="rounded-full border border-braden-sky p-1">
                      <div className="bg-braden-sky w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        A
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-braden-navy">Alex Thompson</h3>
                      <p className="text-sm text-braden-slate">Electrical Apprentice</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-braden-gold pl-4 italic text-braden-navy">
                    "Braden Group made it easy to find an apprenticeship that matched my skills and interests. The support I've received has been amazing."
                  </blockquote>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="relative overflow-hidden rounded-lg border-2 border-braden-sky bg-white p-6 shadow-md">
                  <div className="flex flex-row items-start gap-4">
                    <div className="rounded-full border border-braden-sky p-1">
                      <div className="bg-braden-sky w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        S
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-braden-navy">Sarah Johnson</h3>
                      <p className="text-sm text-braden-slate">Host Employer - Johnson Construction</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-braden-gold pl-4 italic text-braden-navy">
                    "Working with Braden Group has removed the administrative burden of managing apprentices while giving us access to top talent."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-braden-navy text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-braden-gold">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl">
                Whether you're looking for an apprenticeship or want to host an apprentice, we're here to help.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/contact">
                <Button className="bg-braden-sky hover:bg-blue-600 text-white font-semibold px-6 py-3" size="lg">
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
