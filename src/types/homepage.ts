import { LucideIcon } from "lucide-react";

export interface Post {
  id: number;
  title: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  timeAgo: string;
  author: string;
  reputation: number;
  hasAcceptedAnswer?: boolean;
}

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  href: string;
  badge?: string;
}