"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Activity,
  Bookmark,
  Settings,
  Plus,
  MapPin,
  Calendar,
  Link2,
  Users,
  Trophy,
  Star,
  Heart,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedItemsStore } from "@/store";

interface UserStats {
  questionsAsked: number;
  answersGiven: number;
  reputation: number;
  joined: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize with URL param if available, otherwise default to profile
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab");
    return tabParam &&
      ["profile", "activity", "saves", "settings"].includes(tabParam)
      ? tabParam
      : "profile";
  });

  // Handle tab query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["profile", "activity", "saves", "settings"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("profile");
    }
  }, [searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  // Access saved items from store
  const {
    savedItems,
    savedLists,
    getAllSavedItems,
    getSavedItemsCount,
    loadSavedLists,
  } = useSavedItemsStore();
  const allSavedItems = getAllSavedItems();
  const savedItemsCount = getSavedItemsCount();

  // State for backend favorites
  const [backendFavorites, setBackendFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Load favorites from backend when authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (session && status === "authenticated") {
        try {
          setIsLoadingFavorites(true);
          const { questionsApi } = await import('@/services/questions.api');
          const response = await questionsApi.getUserFavorites({
            page: 1,
            limit: 100, // Get all favorites for now
          });
          setBackendFavorites(response.favorites);
        } catch (error) {
          console.error('Failed to load favorites:', error);
        } finally {
          setIsLoadingFavorites(false);
        }
      }
    };

    loadFavorites();
  }, [session, status]);

  // Mock user stats - replace with real data
  const userStats: UserStats = {
    questionsAsked: 5,
    answersGiven: 12,
    reputation: 245,
    joined: "March 2024",
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view your profile
        </h1>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access your profile page.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1070px] pl-4 py-6">
      {/* Profile Header */}
      <ProfileHeader session={session} userStats={userStats} />

      {/* Navigation and Content */}
      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* Left Sidebar Navigation - Consistent Fixed Width */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-6">
            <ProfileSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              savedLists={Object.values(savedLists)}
            />
          </div>
        </div>

        {/* Main Content Area - Takes remaining space with 20px right margin */}
        <div className="flex-1 min-w-0 max-w-4xl">
          {/* Fixed container to prevent layout shifts */}
          <div className="w-full min-h-[600px]">
            <div className="space-y-6">
              {activeTab === "saves" && (
                <SavesSection
                  savedItems={allSavedItems}
                  savedItemsCount={savedItemsCount}
                  backendFavorites={backendFavorites}
                  isLoadingFavorites={isLoadingFavorites}
                />
              )}
              {activeTab === "profile" && (
                <ProfileSection session={session} userStats={userStats} />
              )}
              {activeTab === "activity" && <ActivitySection />}
              {activeTab === "settings" && <SettingsSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileHeader({
  session,
  userStats,
}: {
  session: any;
  userStats: UserStats;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              session?.user?.name?.charAt(0) || "U"
            )}
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.user?.name || "Anonymous User"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Member since {userStats.joined}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                Location not set
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button variant="outline" className="flex items-center gap-2">
          <Settings size={16} />
          Edit profile
        </Button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userStats.reputation}
          </div>
          <div className="text-sm text-gray-600">reputation</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userStats.questionsAsked}
          </div>
          <div className="text-sm text-gray-600">questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userStats.answersGiven}
          </div>
          <div className="text-sm text-gray-600">answers</div>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebar({
  activeTab,
  onTabChange,
  savedLists,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  savedLists: any[];
}) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "saves", label: "Saves", icon: Bookmark },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Tab Navigation - Fixed width buttons */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* My Lists Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              MY LISTS
            </h3>
            <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
              <Plus size={14} />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            {savedLists && savedLists.length > 0 ? (
              savedLists.map((list) => (
                <div
                  key={list.id}
                  className="text-gray-600 px-3 py-1 hover:bg-gray-50 rounded cursor-pointer"
                >
                  {list.name} ({list.itemCount || 0})
                </div>
              ))
            ) : (
              <div className="text-gray-500 px-3 py-1 text-xs italic">
                No lists created yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SavesSection({
  savedItems,
  savedItemsCount,
  backendFavorites = [],
  isLoadingFavorites = false,
}: {
  savedItems: any[];
  savedItemsCount: number;
  backendFavorites?: any[];
  isLoadingFavorites?: boolean;
}) {
  // Combine local saved items with backend favorites
  const totalCount = savedItemsCount + backendFavorites.length;
  const allItems = [...savedItems, ...backendFavorites];

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Saved Items ({totalCount})
            {isLoadingFavorites && (
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            )}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Sort by date
            </Button>
            <Button variant="outline" size="sm">
              <Plus size={16} />
              New list
            </Button>
          </div>
        </div>

        {isLoadingFavorites ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item, index) => {
              // Handle both local saved items and backend favorites
              const isBackendFavorite = 'questionId' in item;
              const displayItem = isBackendFavorite ? item.question : item;
              const itemId = isBackendFavorite ? item.questionId : item.id;
              const savedDate = isBackendFavorite ? item.createdAt : item.savedAt;
              const listName = isBackendFavorite ? item.listName : 'Local';

              return (
                <Link
                  key={`${isBackendFavorite ? 'backend' : 'local'}-${itemId}-${index}`}
                  href={`/questions/${itemId}`}
                >
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 hover:text-blue-600">
                          {displayItem?.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {displayItem?.content || displayItem?.excerpt || "No preview available"}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>
                            Saved on {new Date(savedDate).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {listName}
                          </span>
                          {displayItem?.tags && displayItem.tags.length > 0 && (
                            <div className="flex gap-1">
                              {displayItem.tags.slice(0, 3).map((tag: any) => (
                                <span key={tag.name || tag} className="px-2 py-1 bg-gray-100 rounded">
                                  {tag.name || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-500 hover:text-red-500"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Handle unfavorite
                        }}
                      >
                        <Heart size={16} className="fill-current" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved items yet
            </h3>
            <p className="text-gray-600">
              Items you save will appear here. Start saving questions and
              answers you want to revisit later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSection({
  session,
  userStats,
}: {
  session: any;
  userStats: UserStats;
}) {
  return (
    <div className="w-full space-y-6">
      {/* About */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">About</h2>
        <div className="text-gray-600">
          <p className="mb-4">
            Welcome to your developer profile! This is where you can showcase
            your expertise, track your contributions, and manage your account
            settings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  JavaScript
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  React
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  TypeScript
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Link2 size={14} />
                  <span>Website not set</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>GitHub not linked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MessageSquare size={16} className="text-blue-500 mt-1" />
            <div>
              <p className="text-sm">
                <span className="font-medium">Asked a question:</span> "How to
                implement authentication in Next.js?"
              </p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Star size={16} className="text-yellow-500 mt-1" />
            <div>
              <p className="text-sm">
                <span className="font-medium">Answered a question:</span> "Best
                practices for React state management"
              </p>
              <p className="text-xs text-gray-500 mt-1">5 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Profile Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {userStats.questionsAsked}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {userStats.answersGiven}
            </div>
            <div className="text-sm text-gray-600">Answers</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {userStats.reputation}
            </div>
            <div className="text-sm text-gray-600">Reputation</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitySection() {
  return (
    <div className="w-full space-y-6">
      {/* Activity History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Activity History</h2>
        <div className="space-y-6">
          {/* Activity Timeline */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Posted a new question</h3>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  "How to implement proper error handling in React
                  applications?"
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>3 answers</span>
                  <span>15 views</span>
                  <span>2 upvotes</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Provided an answer</h3>
                  <span className="text-sm text-gray-500">5 days ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Answered: "Best practices for React state management"
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Accepted answer</span>
                  <span>8 upvotes</span>
                  <span>+80 reputation</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy size={14} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Earned a badge</h3>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  "Good Question" - Question received 5+ upvotes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">This Month's Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Answers Given</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">+240</div>
            <div className="text-sm text-gray-600">Reputation</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="w-full space-y-6">
      {/* Account Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Where are you based?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <Button className="bg-orange-500 hover:bg-orange-600">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email notifications</h4>
              <p className="text-sm text-gray-600">
                Receive notifications about your questions and answers
              </p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly digest</h4>
              <p className="text-sm text-gray-600">
                Get a weekly summary of top questions
              </p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New follower notifications</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone follows your profile
              </p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
