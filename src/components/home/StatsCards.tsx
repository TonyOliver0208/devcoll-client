import Link from "next/link";
import { Settings } from "lucide-react";
import { watchedTags } from "@/constants/mockData";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <ReputationCard />
      <BadgeCard />
      <WatchedTagsCard />
    </div>
  );
}

function ReputationCard() {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">Reputation</h3>
      <div className="text-2xl font-bold text-gray-800 mb-1">1</div>
      <div className="text-xs text-gray-500">
        Earn reputation by{" "}
        <Link href="#" className="text-blue-600">
          Asking
        </Link>
        ,{" "}
        <Link href="#" className="text-blue-600">
          Answering
        </Link>{" "}
        &{" "}
        <Link href="#" className="text-blue-600">
          Editing
        </Link>
        .
      </div>
    </div>
  );
}

function BadgeCard() {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        Badge progress
      </h3>
      <div className="text-sm text-gray-800 mb-2">
        Take the tour to earn your first badge!
      </div>
      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
        Get started here
      </button>
    </div>
  );
}

function WatchedTagsCard() {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-600">Watched tags</h3>
        <Settings size={14} className="text-gray-400" />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {watchedTags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Customize your content by watching tags.
      </div>
    </div>
  );
}
