export type BaseDTO = {
  id: string; title: string; townHall: number; type: "war" | "trophy" | "farming" | "hybrid" | "cwl";
  description: string; imageUrl: string; layoutLink: string; tags: string[]; views: number; likes: number;
  featured: boolean; createdAt: string;
};
