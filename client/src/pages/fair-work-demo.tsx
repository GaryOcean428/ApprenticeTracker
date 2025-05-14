import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import EnhancedAwardSelector from '@/components/fair-work/EnhancedAwardSelector';
import { Button } from '@/components/ui/button';

export default function FairWorkDemoPage() {
  const handleRateSelected = (rate: number, award: string, year: number) => {
    console.log(`Selected rate: $${rate.toFixed(2)} for award ${award} in year ${year}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Fair Work Award Interpreter</h1>
          <p className="text-muted-foreground mt-2">
            Advanced award interpretation for calculating apprentice wages and penalty rates
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <EnhancedAwardSelector 
          onRateSelected={handleRateSelected}
          defaultAwardCode="MA000025"
          defaultApprenticeYear={2}
        />
        
        <div className="p-6 border rounded-lg bg-muted/30">
          <h2 className="text-xl font-semibold mb-4">About Fair Work Award Interpretation</h2>
          <p className="mb-4">
            This enhanced Fair Work award interpreter allows you to calculate precise apprentice wages based on multiple factors:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Modern award selection from the Fair Work Commission</li>
            <li>Apprentice year progression (1st through 4th year)</li>
            <li>Adult apprentice status (different rates for apprentices 21 years or older)</li>
            <li>Year 12 completion bonus rates</li>
            <li>Industry sector variations (commercial, residential, industrial)</li>
            <li>Historical rate trends for financial planning</li>
            <li>Detailed penalty rates and allowances</li>
          </ul>
          <p>
            Proper award interpretation is essential for GTOs to maintain compliance with Fair Work regulations and ensure apprentices are paid correctly while host employers are charged appropriate rates.
          </p>
        </div>
      </div>
    </div>
  );
}