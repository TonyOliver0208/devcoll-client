interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarCard({ title, children }: SidebarCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
