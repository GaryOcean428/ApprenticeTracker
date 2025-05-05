'use client';

import { Clock, FileWarning, AlertTriangle, Award } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info' | 'success';
  timeLeft?: string;
}

const icons = {
  warning: Clock,
  error: FileWarning,
  info: AlertTriangle,
  success: Award,
} as const;

const notifications: Notification[] = [
  {
    id: '1',
    title: 'White Card Expiring',
    description: "John Doe's White Card is expiring soon",
    type: 'warning',
    timeLeft: '15 days',
  },
  {
    id: '2',
    title: 'Missing Police Check',
    description: "Sarah Smith's Police Check is missing",
    type: 'error',
  },
  {
    id: '3',
    title: 'Overdue Unit Completion',
    description: 'Michael Johnson has an overdue unit',
    type: 'warning',
    timeLeft: '5 days overdue',
  },
];

export function NotificationList(): JSX.Element {
  return (
    <div className='space-y-4'>
      {notifications.map((notification: Notification) => {
        const Icon = icons[notification.type];

        return (
          <div
            key={notification.id}
            className='flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4'
          >
            <div className='rounded-full bg-amber-50 p-2'>
              <Icon className='h-5 w-5 text-amber-500' />
            </div>
            <div className='flex-1 space-y-1'>
              <p className='font-medium text-gray-900'>{notification.title}</p>
              <p className='text-sm text-gray-500'>{notification.description}</p>
            </div>
            {notification.timeLeft && (
              <span className='text-sm text-gray-500'>{notification.timeLeft}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
