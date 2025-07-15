import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-500/30 text-blue-800 dark:text-blue-300 bg-blue-500/10 [&>svg]:text-blue-500',
        success:
          'border-green-500/30 text-green-800 dark:text-green-300 bg-green-500/10 [&>svg]:text-green-500',
        warning:
          'border-yellow-500/30 text-yellow-800 dark:text-yellow-300 bg-yellow-500/10 [&>svg]:text-yellow-500',
        error:
          'border-red-500/30 text-red-800 dark:text-red-300 bg-red-500/10 [&>svg]:text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    // Determine which icon to show based on the variant
    const IconComponent = {
      info: Info,
      success: CheckCircle2,
      warning: AlertCircle,
      error: XCircle,
      default: null,
    }[variant || 'default'];

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        {children}
      </div>
    );
  }
);

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
);

Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
