export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
  type: 'workshop' | 'meetup' | 'conference' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants?: number;
  currentParticipants?: number;
  organizer: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
} 