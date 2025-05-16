import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTestPage() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test parameters
      const awardCode = 'MA000025'; // Electrical Award
      const year = 2025;
      const apprenticeYear = 2;
      const isAdult = false;
      const hasCompletedYear12 = false;
      
      const response = await fetch(
        `/api/fairwork-enhanced/apprentice-rates?awardCode=${awardCode}&year=${year}&apprenticeYear=${apprenticeYear}&isAdult=${isAdult}&hasCompletedYear12=${hasCompletedYear12}`
      );
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError('Failed to fetch API data: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-6">
        <Button onClick={testApi} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Apprentice Rates API'}
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      {apiResponse && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>
              Testing award MA000025, 2nd year apprentice (non-adult, no year 12)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <strong>Base Hourly Rate:</strong> ${apiResponse.data?.rates.baseHourly.toFixed(2)}
            </div>
            <div className="text-sm mb-4">
              <strong>Final Hourly Rate:</strong> ${apiResponse.data?.rates.hourly.toFixed(2)}
            </div>
            <div className="text-sm mb-4">
              <strong>Parameters:</strong> 
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(apiResponse.data?.parameters, null, 2)}
              </pre>
            </div>
            <div className="text-sm">
              <strong>Full Response:</strong>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-80">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}