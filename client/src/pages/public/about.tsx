import PublicLayout from "@/layouts/public-layout";

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                About Braden Group
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Building the future workforce of Western Australia through quality apprenticeships and traineeships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                Our Mission
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Creating pathways to success
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                Braden Group is committed to bridging the skills gap in Western Australia by connecting apprentices 
                with quality host employers. We believe in creating meaningful careers while helping businesses 
                access the talent they need to thrive.
              </p>
              <p className="text-gray-500 md:text-xl/relaxed">
                As a Group Training Organisation (GTO), we take on the administrative burden of managing 
                apprenticeships and traineeships, allowing both apprentices and host employers to focus on what 
                matters most - developing skills and building businesses.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg bg-gray-100 p-8 h-full w-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-blue-600">Our Core Values</div>
                  <ul className="space-y-4 mt-4 text-left">
                    <li className="flex items-start">
                      <div className="mr-2 rounded-full bg-blue-500 p-1 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Excellence</h3>
                        <p className="text-gray-500">We strive for excellence in all aspects of apprentice management.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 rounded-full bg-blue-500 p-1 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Integrity</h3>
                        <p className="text-gray-500">We operate with transparency and honesty in all our dealings.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 rounded-full bg-blue-500 p-1 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Innovation</h3>
                        <p className="text-gray-500">We embrace technology and new approaches to improve outcomes.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 rounded-full bg-blue-500 p-1 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Support</h3>
                        <p className="text-gray-500">We provide continuous support to both apprentices and host employers.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role as GTO Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Our Role as a Group Training Organisation
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                As a GTO, we serve as the legal employer of apprentices and trainees, while partnering with host employers to provide on-the-job training.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                  className="h-6 w-6"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Recruitment & Selection</h3>
              <p className="text-gray-500">
                We recruit, screen, and place qualified apprentices with suitable host employers, ensuring the right fit for both parties.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                  className="h-6 w-6"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Administration & Compliance</h3>
              <p className="text-gray-500">
                We manage payroll, insurance, and all paperwork associated with apprenticeships, ensuring full compliance with regulations.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                  className="h-6 w-6"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Support & Mentoring</h3>
              <p className="text-gray-500">
                We provide ongoing support to both apprentices and host employers throughout the apprenticeship journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Partnerships Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Industry Partnerships & Compliance
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We work closely with industry partners and regulatory bodies to ensure the highest standards in apprenticeship management.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12">
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">Partner</span>
                </div>
                <h3 className="text-xl font-bold">Training Providers</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">Partner</span>
                </div>
                <h3 className="text-xl font-bold">Industry Associations</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">Partner</span>
                </div>
                <h3 className="text-xl font-bold">Government Bodies</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">Partner</span>
                </div>
                <h3 className="text-xl font-bold">Local Businesses</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
