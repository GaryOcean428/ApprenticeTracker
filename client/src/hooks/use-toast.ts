import { toast as sonnerToast } from 'sonner';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'destructive';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
};

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 5000 }: ToastProps) => {
    switch (variant) {
      case 'success':
        sonnerToast.success(title || 'Success', {
          description,
          duration,
        });
        break;
      case 'error':
      case 'destructive':
        sonnerToast.error(title || 'Error', {
          description,
          duration,
        });
        break;
      case 'warning':
        sonnerToast.warning(title || 'Warning', {
          description,
          duration,
        });
        break;
      default:
        sonnerToast(title || '', {
          description,
          duration,
        });
    }
  };

  return { toast };
}
