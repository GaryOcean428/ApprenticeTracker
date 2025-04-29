import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { handleApiError } from '@/lib/api-error';

interface MFASetupProps {
  qrCode: string;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

export function MFASetup({ qrCode, onVerify, onCancel }: MFASetupProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      const success = await onVerify(verificationCode);
      
      if (!success) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app and enter the verification code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            <Image
              src={qrCode}
              alt="QR Code for 2FA setup"
              width={256}
              height={256}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'verification-error' : undefined}
          />
          {error && (
            <p id="verification-error" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={!verificationCode || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
