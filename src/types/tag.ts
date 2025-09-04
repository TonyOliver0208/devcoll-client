export interface Tag {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  askedToday: number;
  askedThisWeek: number;
}

export interface TagsPageProps {
  tags?: Tag[]; 
}

export interface TagCardProps {
  tag: Tag;
}
