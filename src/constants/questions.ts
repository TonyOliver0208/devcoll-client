import { Question } from "@/types/questions";

export const mockQuestions: Question[] = [
  {
    id: 1,
    title: "Ignore metadata attributes in AsciiDoc with Vale",
    votes: 0,
    answers: 0,
    views: 2,
    tags: ["static-analysis", "asciidoc"],
    timeAgo: "48 secs ago",
    author: {
      name: "arie",
      reputation: 852
    },
    excerpt: "I have AsciiDoc files with the following header: = Title :description: My page description. :key-words: keyword 1,keyword 2,keyword 3 I would like Vale to ignore the line starting with :keyword..."
  },
  {
    id: 2,
    title: "Parameter 0 of method entityManagerFactory in PrimaryDataSourceConfig required a bean of type EntityManagerFactoryBuilder that could not be found",
    votes: 0,
    answers: 0,
    views: 7,
    tags: ["java", "postgresql", "spring-boot", "backend"],
    timeAgo: "6 mins ago",
    author: {
      name: "Miraj Hossain Shawon",
      reputation: 35
    },
    excerpt: "I am trying to configure 2 databases in a single spring boot application.So that i have configured 2 separate Config files for postgres and postgres vector db. @Configuration @..."
  },
  {
    id: 3,
    title: "webpack aliasing fails in NextJS + ts app",
    votes: 0,
    answers: 0,
    views: 6,
    tags: ["reactjs", "typescript", "next.js", "webpack"],
    timeAgo: "7 mins ago",
    author: {
      name: "anwar",
      reputation: 428
    },
    excerpt: "While working on a modular Next.js-13 app, I ran into one persistent challenge: plugin-based component overrides. The Setup We structured the app like this: /components/singleNews..."
  },
  {
    id: 4,
    title: "Backward and forward compatibility issues with protobufs in Google Pub/Sub",
    votes: 0,
    answers: 0,
    views: 10,
    tags: ["enums", "protocol-buffers", "google-cloud-pubsub"],
    timeAgo: "17 mins ago",
    author: {
      name: "Mike Williamson",
      reputation: 3456
    },
    excerpt: "We use protocol buffers both for gRPC server-to-server communication and for publishing messages to Pub/Sub. Pub/Sub is fairly sensitive to schema changes, not allowing any schema..."
  },
  {
    id: 5,
    title: "PyQt6 - How can I change the direction of the scale/ruler",
    votes: 0,
    answers: 0,
    views: 10,
    tags: ["python", "pyqt6"],
    timeAgo: "22 mins ago",
    author: {
      name: "user123",
      reputation: 156
    },
    bountyAmount: 50,
    excerpt: "I'm working on a PyQt6 application where I need to create a custom scale/ruler widget. Currently, I have a horizontal scale, but I want to change its direction..."
  }
];
