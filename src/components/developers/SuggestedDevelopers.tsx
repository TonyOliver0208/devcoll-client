interface Developer {
  name: string;
  role: string;
  skills: string[];
  avatar: string;
}

const SuggestedDevelopers = () => {
  const developers: Developer[] = [
    {
      name: 'Jane Smith',
      role: 'Frontend Developer',
      skills: ['Frontend', 'Backend'],
      avatar: '/avatars/jane.jpg',
    },
    {
      name: 'John Doe',
      role: 'Fullstack Developer',
      skills: ['Fullstack', 'AI'],
      avatar: '/avatars/john.jpg',
    },
    {
      name: 'Alex Johnson',
      role: 'Backend Developer',
      skills: ['Backend', 'Data'],
      avatar: '/avatars/alex.jpg',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Suggested Developers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {developers.map((dev) => (
          <div key={dev.name} className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <img
                src={dev.avatar}
                alt={dev.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{dev.name}</h3>
                <p className="text-sm text-gray-600">{dev.role}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {dev.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
            <button className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedDevelopers;
