import { 
  Home, HelpCircle, Tag, Bookmark, Trophy, 
  MessageSquare, FileText, Users, Building2 
} from "lucide-react";
import { NavigationItem } from "@/types/homepage";

export const sidebarItems: NavigationItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: HelpCircle, label: "Questions", href: "/questions" },
  { icon: Tag, label: "Tags", href: "/tags" },
  { icon: Bookmark, label: "Saves", href: "/saves" },
  { icon: Trophy, label: "Challenges", badge: "1", href: "/challenges" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: FileText, label: "Articles", href: "/articles" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Building2, label: "Companies", href: "/companies" }
];