import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { SearchIcon } from '@radix-ui/react-icons';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get help and support',
};

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the system',
    articles: 12,
  },
  {
    title: 'Payroll & Finance',
    description: 'Manage payroll and financial operations',
    articles: 15,
  },
  {
    title: 'Training & Development',
    description: 'Training program management guides',
    articles: 8,
  },
  {
    title: 'Compliance & Safety',
    description: 'Workplace safety and compliance guides',
    articles: 10,
  },
  {
    title: 'System Settings',
    description: 'Configure system settings and preferences',
    articles: 14,
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    articles: 20,
  },
];

export default function HelpPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <Button variant="outline">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search Help
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">79</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
                <p className="text-sm font-medium">
                  {category.articles} articles
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}