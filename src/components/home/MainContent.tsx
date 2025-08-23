import WelcomeSection from "./WelcomeSection";
import StatsCards from "./StatsCards";
import PostsFeed from "./PostsFeed";
import RightSidebar from "./RightSidebar";
import { mockPosts } from "@/constants/mockData";

interface MainContentProps {
  username: string;
}

export default function MainContent({ username }: MainContentProps) {
  return (
    <main className="flex-1 lg:ml-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <WelcomeSection username={username} />
            <StatsCards />
            <PostsFeed posts={mockPosts} />
          </div>
          <aside className="xl:col-span-4">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </main>
  );
}
