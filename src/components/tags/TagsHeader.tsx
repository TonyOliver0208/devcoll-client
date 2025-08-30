export default function TagsHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Tags</h1>
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          A tag is a keyword or label that categorizes your question with other, similar questions.
        </p>
        <p>
          Using the right tags makes it easier for others to find and answer your question.
        </p>
      </div>
      <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
        Show all tag synonyms
      </button>
    </div>
  );
}
