interface DashboardHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({ title, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">{title}</h1>
      <div>{children}</div>
    </div>
  );
}
