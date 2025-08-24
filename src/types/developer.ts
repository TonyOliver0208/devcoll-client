export interface Developer {
  id: number;
  name: string;
  username: string;
  title: string;
  reputation: number;
  badges: {
    gold: number;
    silver: number;
    bronze: number;
  };
  tags: string[];
  avatar: string;
  answersCount: number;
  questionsCount: number;
  location?: string;
}


export interface DeveloperBadges {
  gold: number;
  silver: number;
  bronze: number;
}
