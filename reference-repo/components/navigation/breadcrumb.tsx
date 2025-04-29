interface BreadcrumbProps {
  pathname: string;
}

export function Breadcrumb({ pathname }: BreadcrumbProps): JSX.Element {
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          return (
            <li key={href}>
              {/* Breadcrumb item implementation */}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
