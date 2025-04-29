export interface DashboardAlert {
  /** Unique identifier for the alert */
  id: string;

  /** Title of the alert */
  title: string;

  /** Description of the alert */
  description: string;

  /** Severity of the alert */
  severity: 'high' | 'medium' | 'low';

  /** Type of the alert */
  type: 'warning' | 'info';
}
