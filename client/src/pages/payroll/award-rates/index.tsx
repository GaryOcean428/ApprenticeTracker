import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Button, Loader, Alert, AlertTitle, AlertDescription } from '@/components/common';
import { Calendar, CheckCircle, Clock, DollarSign, Filter, Search } from 'lucide-react';

interface AwardRate {
  id: number;
  awardCode: string;
  awardName: string;
  classificationCode: string;
  classificationName: string;
  hourlyRate: number;
  weeklyRate: number;
  annualRate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  allowances: string[];
}

const AwardRatesPage: React.FC = () => {
  const [selectedAward, setSelectedAward] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: awards = [], isLoading: awardsLoading, error: awardsError } = useQuery<any[]>({
    queryKey: ['/api/payroll/awards'],
  });

  const { data: rates = [], isLoading: ratesLoading, error: ratesError } = useQuery<AwardRate[]>({
    queryKey: ['/api/payroll/rates', selectedAward],
    enabled: !!selectedAward,
  });

  const isLoading = awardsLoading || ratesLoading;
  const error = awardsError || ratesError;

  // Filter rates based on search term
  const filteredRates = rates ? rates.filter((rate: AwardRate) => 
    rate.classificationName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rate.classificationCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Award Rates</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view Fair Work award rates and classifications
          </p>
        </div>
        <Button>
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify Current Rates
        </Button>
      </div>

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertTitle>Error Loading Awards</AlertTitle>
          <AlertDescription>
            There was a problem loading the award rates. Please try again later.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Award selection sidebar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Modern Awards</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {awardsLoading ? (
                <div className="p-6 flex justify-center">
                  <Loader size="lg" text="Loading awards..." />
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search awards..."
                        className="pl-8 w-full h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <ul className="p-0 m-0">
                    {awards?.map((award: { code: string; name: string }) => (
                      <li
                        key={award.code}
                        className={`px-4 py-3 border-b hover:bg-muted cursor-pointer ${selectedAward === award.code ? 'bg-muted font-medium' : ''}`}
                        onClick={() => setSelectedAward(award.code)}
                      >
                        <div className="font-medium">{award.name}</div>
                        <div className="text-xs text-muted-foreground">{award.code}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rates display area */}
        <div className="lg:col-span-9">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {selectedAward ? 
                  `${awards?.find((a: { code: string }) => a.code === selectedAward)?.name} (${selectedAward})` : 
                  'Select an Award'}
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search classifications..."
                    className="pl-8 w-full h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAward ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select an award from the list to view rates
                </div>
              ) : ratesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" text="Loading rates..." />
                </div>
              ) : filteredRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No classifications found matching your search
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-3 text-left border-b">Classification</th>
                        <th className="px-4 py-3 text-left border-b">Code</th>
                        <th className="px-4 py-3 text-right border-b">
                          <div className="flex items-center justify-end">
                            <DollarSign className="mr-1 h-4 w-4" />
                            Hourly
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right border-b">
                          <div className="flex items-center justify-end">
                            <Calendar className="mr-1 h-4 w-4" />
                            Weekly
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right border-b">
                          <div className="flex items-center justify-end">
                            <Clock className="mr-1 h-4 w-4" />
                            Effective Date
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRates.map((rate: AwardRate) => (
                        <tr key={`${rate.classificationCode}`} className="hover:bg-muted/50">
                          <td className="px-4 py-3 border-b">{rate.classificationName}</td>
                          <td className="px-4 py-3 border-b">{rate.classificationCode}</td>
                          <td className="px-4 py-3 border-b text-right">
                            ${rate.hourlyRate.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b text-right">
                            ${rate.weeklyRate.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b text-right">
                            {new Date(rate.effectiveFrom).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AwardRatesPage;
