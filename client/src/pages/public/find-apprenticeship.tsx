import { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { jobsApi, type JobListing } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Use API service for job listings
function useJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const data = await jobsApi.getJobs();
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load job listings. Please try again later.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load job listings.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [toast]);

  return { jobs, loading, error };
}

export default function FindApprenticeshipPage() {
  const { jobs, loading, error } = useJobs();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleApply = (jobId: string) => {
    setSelectedJob(jobId);
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Connect to the CRM through our API
      const application = {
        jobId: selectedJob as string,
        firstName: formData.get('first-name') as string,
        lastName: formData.get('last-name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        location: formData.get('location') as string,
        education: formData.get('education') as string,
        experience: (formData.get('experience') as string) || undefined,
        interest: formData.get('interest') as string,
      };

      const response = await jobsApi.submitApplication(application);

      if (response.success) {
        toast({
          title: 'Application Submitted',
          description: response.message,
          variant: 'success',
        });
        setShowForm(false);
        setSelectedJob(null);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your application. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Find an Apprenticeship
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Browse current apprenticeship and traineeship opportunities and start your career
                journey with Braden Group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-6 md:py-12 bg-white border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="text" placeholder="Search by keyword..." className="w-full" />
              <Button type="submit">Search</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="perth">Perth Metro</SelectItem>
                  <SelectItem value="joondalup">Joondalup</SelectItem>
                  <SelectItem value="fremantle">Fremantle</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {jobs.map((job: JobListing) => (
                <Card key={job.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {job.location} • {job.type}
                        </CardDescription>
                      </div>
                      <div className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        New
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {job.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleApply(job.id)}
                    >
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination - Static for MVP */}
          <div className="flex items-center justify-center space-x-2 mt-12">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      {showForm && (
        <section id="application-form" className="w-full py-12 md:py-24 bg-white border-t">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter mb-8">
                Apply for {jobs.find((j: JobListing) => j.id === selectedJob)?.title}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input id="first-name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input id="last-name" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="e.g. Perth, WA" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Level *</Label>
                  <Select required>
                    <SelectTrigger id="education">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year10">Year 10</SelectItem>
                      <SelectItem value="year12">Year 12</SelectItem>
                      <SelectItem value="cert">Certificate</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe any relevant experience or skills you have"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest">Why are you interested in this apprenticeship? *</Label>
                  <Textarea id="interest" required />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedJob(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Why Choose Braden Group for Your Apprenticeship
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We offer a supportive environment for apprentices to thrive throughout their
                training journey.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
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
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Ongoing Support</h3>
              <p className="text-gray-500">
                Dedicated field officers provide regular check-ins and support throughout your
                apprenticeship journey.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Rotation Opportunities</h3>
              <p className="text-gray-500">
                Gain diverse experience by working with different host employers throughout your
                apprenticeship.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
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
              <h3 className="text-xl font-bold mb-2">Industry Connections</h3>
              <p className="text-gray-500">
                Access a network of leading employers and industry professionals to build your
                career.
              </p>
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
                Ready to start your career?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Don't see the right opportunity? Register your interest and we'll notify you when
                new apprenticeships become available.
              </p>
            </div>
            <div className="space-x-4">
              <Button variant="secondary" size="lg">
                Register Interest
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
