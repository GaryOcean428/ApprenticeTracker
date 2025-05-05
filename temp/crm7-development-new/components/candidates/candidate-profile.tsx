'use client';

import { MapPin, Phone, Mail, Link } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface CandidateProfileProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    status: string;
    about: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    availability: string;
    preferredLocation: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    links: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };
}

export function CandidateProfile({ candidate }: CandidateProfileProps): JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${candidate.id}.png`}
                  alt={candidate.name}
                />
                <AvatarFallback>
                  {candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                <CardDescription className="text-lg">
                  {candidate.title}
                </CardDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{candidate.status}</Badge>
                  <Badge variant="secondary">
                    Available {candidate.availability}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Message</Button>
              <Button>Schedule Interview</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{candidate.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{candidate.email}</span>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(candidate.links).map(
                ([platform, url]) =>
                  url && (
                    <div
                      key={platform}
                      className="flex items-center space-x-2"
                    >
                      <Link className="h-4 w-4 text-gray-500" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    </div>
                  ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{candidate.about}</p>
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} · {exp.duration}
                    </p>
                    <p className="mt-2 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution} · {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Location Preference</h4>
                  <p className="text-sm text-muted-foreground">
                    {candidate.preferredLocation}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Salary Expectation</h4>
                  <p className="text-sm text-muted-foreground">
                    {candidate.salary.currency}{' '}
                    {candidate.salary.min.toLocaleString()} -{' '}
                    {candidate.salary.max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Availability</h4>
                  <p className="text-sm text-muted-foreground">
                    {candidate.availability}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
