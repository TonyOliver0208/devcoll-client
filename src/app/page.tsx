import WelcomeSection from "@/components/welcome/WelcomeSection";
import SuggestedDevelopers from "@/components/developers/SuggestedDevelopers";
import RightSidebar from "@/components/navigation/RightSidebar";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <WelcomeSection username="Phước Long Nguyễn" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">{/* Stats cards here */}</div>

      {/* Suggested Developers Section */}
      <div>
        <SuggestedDevelopers />
      </div>

      {/* Main Content + Sidebar */}
      <div className="flex gap-6">
        {/* Questions Feed */}
        <div className="flex-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Interesting posts for you</h2>
              <button className="text-[#FFA116] hover:text-[#F28C01]">
                Customize your feed
              </button>
            </div>

            {/* Q&A Cards will go here */}
            <div className="space-y-4">
              {/* Example Q&A Card */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-3">
                  <div className="text-center min-w-[65px]">
                    <div className="text-sm text-gray-600">0 votes</div>
                    <div className="text-xs text-green-600 mt-1">1 answer</div>
                  </div>
                  <div>
                    <h3 className="text-[#0074CC] hover:text-[#0995FF] font-medium">
                      Pandas transform list Column to string
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      I'm reading the PowerBI GetActivities and have some
                      problems writing the data to a pandas dataFrame...
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-[#E1ECF4] text-[#39739D] text-xs rounded">
                        python
                      </span>
                      <span className="px-2 py-1 bg-[#E1ECF4] text-[#39739D] text-xs rounded">
                        pandas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="w-80">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
