import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-2xl font-medium">{title}</h1>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </>
  );
}
