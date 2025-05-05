import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form } from '@/components/ui/form';

const paymentSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_account: z.string().min(1, 'Recipient account is required'),
  recipient_bank: z.string().min(1, 'Recipient bank is required')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
}

export function PaymentForm({ onSubmit }: PaymentFormProps): JSX.Element {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      account_id: '',
      amount: 0,
      description: '',
      recipient_name: '',
      recipient_account: '',
      recipient_bank: ''
    }
  });

  const handleSubmit = async (data: PaymentFormData): Promise<void> => {
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
