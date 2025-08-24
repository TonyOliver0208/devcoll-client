import WelcomeSection from "./WelcomeSection";
import StatsCards from "./StatsCards";
import PostsFeed, { PostsHeader } from "./PostsFeed";
import RightSidebar from "./RightSidebar";
import { mockPosts } from "@/constants/mockData";

interface MainContentProps {
  username: string;
}

export default function MainContent({ username }: MainContentProps) {
  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-6">
        <WelcomeSection username={username} />

        <div className="max-w-7xl mx-auto px-4">
          <StatsCards />

          <PostsHeader />

          {/* Posts Feed and Right Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8">
              <PostsFeed posts={mockPosts} />
            </div>
            <aside className="xl:col-span-4">
              <RightSidebar />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
