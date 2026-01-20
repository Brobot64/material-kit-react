export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  // API fields
  _id?: string;
  fullName?: string;
  isActive?: boolean;
  role?: string;
  themePreference?: string;
  languagePreference?: string;
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
}

