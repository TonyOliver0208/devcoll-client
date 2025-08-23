import { Post } from "@/types/homepage";

export const mockPosts: Post[] = [
  {
    id: 1,
    title: "python - is there a command to move which merge folders but not overwrite files?",
    votes: 0,
    answers: 0,
    views: 2,
    tags: ["python", "file"],
    timeAgo: "52 secs ago",
    author: "Martian2020",
    reputation: 458,
  },
  {
    id: 2,
    title: "ag-charts-react not working with nextjs v15",
    votes: 0,
    answers: 1,
    views: 12,
    tags: ["javascript", "reactjs", "next.js"],
    timeAgo: "9 mins ago",
    author: "Yong Shun",
    reputation: 53600,
    hasAcceptedAnswer: true,
  },
  {
    id: 3,
    title: "How can I speed up a QA Langchain using load_qa_with_sources_chain?",
    votes: 1,
    answers: 2,
    views: 9000,
    tags: ["python", "python-3.x", "language-model", "langchain", "py-langchain"],
    timeAgo: "13 mins ago",
    author: "Community Bot",
    reputation: 1,
  }
];

export const watchedTags = ["c#", "javascript", "python"];
