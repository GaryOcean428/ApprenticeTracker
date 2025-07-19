import { Button, ButtonProps } from '@/components/ui/button';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface ActionButtonProps extends ButtonProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  label: string;
}

/**
 * A button that is conditionally rendered based on user permissions
 */
export function ActionButton({
  permission,
  permissions,
  requireAll = false,
  label,
  ...props
}: ActionButtonProps) {
  return (
    <PermissionGuard permission={permission} permissions={permissions} requireAll={requireAll}>
      <Button {...props}>{label}</Button>
    </PermissionGuard>
  );
}
