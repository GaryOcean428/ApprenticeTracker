import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form } from '@/components/ui/form';

const bankAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  routing_number: z.string().min(9, 'Routing number must be 9 digits'),
  bank_name: z.string().min(1, 'Bank name is required')
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  onSubmit: (data: BankAccountFormData) => Promise<void>;
}

export function BankAccountForm({ onSubmit }: BankAccountFormProps): JSX.Element {
  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_name: '',
      account_number: '',
      routing_number: '',
      bank_name: ''
    }
  });

  const handleSubmit = async (data: BankAccountFormData): Promise<void> => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Form fields */}
      </form>
    </Form>
  );
}
