interface WelcomeSectionProps {
  username: string;
}

const WelcomeSection = ({ username }: WelcomeSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center">
          <span className="text-2xl">👋</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {username}</h1>
          <p className="text-gray-600">
            Find answers to your technical questions and help others answer
            theirs.
          </p>
        </div>
      </div>
      <button className="px-6 py-2.5 bg-[#FFA116] text-white rounded-lg hover:bg-[#F28C01] font-medium">
        Ask Question
      </button>
    </div>
  );
};

export default WelcomeSection;
