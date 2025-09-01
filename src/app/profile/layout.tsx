import AppLayout from "@/components/layout/AppLayout";
import ProfilePage from "./page";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
