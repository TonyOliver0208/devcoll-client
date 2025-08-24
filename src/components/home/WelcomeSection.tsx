import { MessageSquarePlus } from "lucide-react";

interface WelcomeSectionProps {
  username: string;
}

export default function WelcomeSection({ username }: WelcomeSectionProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-6 mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-lg">👋</span>
            </div>
            <div>
              <h1 className="text-xl font-normal text-gray-900 mb-1">
                Welcome back, {username}
              </h1>
              <p className="text-gray-600 text-sm">
                Find answers to your technical questions and help others answer theirs.
              </p>
            </div>
          </div>
          <button className="bg-[#0a95ff] hover:bg-[#0074cc] text-white px-4 py-2.5 text-sm rounded-sm shadow-sm border border-[#0a95ff] hover:border-[#0074cc] flex items-center gap-2 font-medium transition-colors">
            <MessageSquarePlus size={16} />
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
