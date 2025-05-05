import './notification-template.css';
import styles from './notification-template.module.css';

interface NotificationTemplateProps {
  title: string;
  message: string;
  recipientName: string;
  actionUrl?: string;
  actionText?: string;
}

export function NotificationTemplate({
  title,
  message,
  recipientName,
  actionUrl,
  actionText,
}: NotificationTemplateProps): React.ReactElement {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <div className={styles.container}>
          <h1 className={styles.title}>{title}</h1>
          <p>Hello {recipientName},</p>
          <p>{message}</p>
          {actionUrl && actionText && (
            <p>
              <a href={actionUrl} className={styles.actionButton}>
                {actionText}
              </a>
            </p>
          )}
          <p>
            Best regards,
            <br />
            Your Team
          </p>
        </div>
      </body>
    </html>
  );
}
