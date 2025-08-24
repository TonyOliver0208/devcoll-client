import { MessageSquarePlus } from "lucide-react";

interface WelcomeSectionProps {
  username: string;
}

export default function WelcomeSection({ username }: WelcomeSectionProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-6 mb-6">
      <div className="px-4">
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
                Find answers to your technical questions and help others answer
                theirs.
              </p>
            </div>
          </div>
          <button
            className="border border-[#0a95ff] text-[#0a95ff] 
             hover:bg-[#e6f3ff] focus:bg-[#e6f3ff]
             px-2 py-2.5 text-xs rounded-sm shadow-sm flex items-center gap-2 
             font-medium transition-all duration-200 cursor-pointer 
             focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 
             active:scale-95 bg-white"
          >
            <MessageSquarePlus size={16} />
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
