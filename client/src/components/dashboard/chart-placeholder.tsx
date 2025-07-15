import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ChartPlaceholderProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

const ChartPlaceholder = ({ title, icon: Icon, description }: ChartPlaceholderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted border border-border rounded-lg flex items-center justify-center">
          <div className="text-center px-4">
            <Icon className="mx-auto h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartPlaceholder;
