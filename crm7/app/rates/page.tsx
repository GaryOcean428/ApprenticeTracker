import type { Metadata } from 'next';

import { RatesClient } from './rates-client';

export const metadata: Metadata = {
  title: 'Rate Calculator',
  description: 'Calculate and manage rates for apprentices, trainees, and employees',
};

export default function RatesPage(): React.JSX.Element {
  return <RatesClient />;
}
