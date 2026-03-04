import { ReactNode } from "react";

interface DashboardEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const DashboardEmptyState = ({ icon, title, description, action }: DashboardEmptyStateProps) => {
  return (
    <div className="glass rounded-2xl p-12 md:p-16 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
};

export default DashboardEmptyState;
