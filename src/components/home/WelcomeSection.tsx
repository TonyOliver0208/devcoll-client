import { MessageSquarePlus } from "lucide-react";

interface WelcomeSectionProps {
  username: string;
}

export default function WelcomeSection({ username }: WelcomeSectionProps) {
  return (
    <div className="bg-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              👋
            </div>
            <h1 className="text-2xl font-normal text-gray-800">
              Welcome back, {username}
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Find answers to your technical questions and help others answer
            theirs.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <MessageSquarePlus size={16} />
          Ask Question
        </button>
      </div>
    </div>
  );
}
