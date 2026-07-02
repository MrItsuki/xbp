export interface Part {
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  perParticipant: number;
  updatedAt?: number;
}

export interface Project {
  name: string;
  description?: string;
  createdAt?: number;
  parts?: Record<string, Part> | null;
}

export interface Workshop {
  projectId: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  participants?: number;
  createdAt?: number;
}

export type Projects = Record<string, Project>;
export type Workshops = Record<string, Workshop>;
