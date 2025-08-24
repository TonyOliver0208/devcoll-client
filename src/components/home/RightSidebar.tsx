const RightSidebar = () => {
  const trendingTags = [
    { name: "JavaScript", count: 1234 },
    { name: "UI/UX", count: 890 },
    { name: "Python", count: 756 },
    { name: "React", count: 645 },
  ];

  const featuredMeta = [
    {
      title: "Upcoming initiatives on Stack Overflow",
      description: "and across the Stack Exchange network...",
    },
    {
      title: "Further Experimentation with Comment and Post Enhancements",
      description: "Meta Stack Overflow",
    },
  ];

  const hotMetaPosts = [
    {
      title: "Can I post the contents of an email from a vendor in an answer?",
      votes: 15,
    },
    {
      title:
        "What is causing the spike in Google Teams for Stack Overflow in the last few...",
      votes: 28,
    },
  ];

  return (
    <div className=" space-y-2">
      {/* Trending Tags */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Trending Tags</h2>
        <div className="space-y-2">
          {trendingTags.map((tag) => (
            <div
              key={tag.name}
              className="flex items-center justify-between hover:bg-gray-50 p-2 rounded"
            >
              <span className="text-blue-600">#{tag.name}</span>
              <span className="text-gray-500 text-sm">{tag.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Meta */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Featured on Meta</h2>
        <div className="space-y-4">
          {featuredMeta.map((item) => (
            <div key={item.title} className="space-y-1">
              <h3 className="font-medium text-blue-600 hover:text-blue-800">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Meta Posts */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Hot Meta Posts</h2>
        <div className="space-y-4">
          {hotMetaPosts.map((post) => (
            <div key={post.title} className="flex items-start gap-3">
              <div className="text-sm font-medium text-orange-500">
                {post.votes}
              </div>
              <h3 className="text-sm text-blue-600 hover:text-blue-800">
                {post.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
