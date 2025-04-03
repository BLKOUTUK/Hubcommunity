/**
 * API Types
 * 
 * This file contains TypeScript interfaces for API requests and responses.
 */

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Error response from the API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Pagination metadata in list responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated response from the API
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
  message?: string;
}

/**
 * User profile
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Reward points activity
 */
export interface RewardActivity {
  id: string;
  userId: string;
  action: string;
  points: number;
  source: 'BLKOUTNXT' | 'BLKOUTHUB';
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * User badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: string;
  earnedAt?: string;
}

/**
 * User rewards
 */
export interface UserRewards {
  userId: string;
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  nextLevel: 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | null;
  pointsToNextLevel: number;
  badges: Badge[];
  recentActivities: RewardActivity[];
  lastUpdated: string;
}

/**
 * Award points request
 */
export interface AwardPointsRequest {
  userId: string;
  points: number;
  description: string;
  source?: 'BLKOUTNXT' | 'BLKOUTHUB';
  metadata?: Record<string, any>;
}

/**
 * Community member
 */
export interface CommunityMember {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  tags?: string[];
  avatar?: string;
  featured?: boolean;
  joinDate?: string;
}

/**
 * Event
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}

/**
 * Resource
 */
export interface Resource {
  id: string;
  title: string;
  description?: string;
  resourceType: string;
  link: string;
  tags?: string[];
  contributorId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Feedback
 */
export interface Feedback {
  id: string;
  userId: string;
  type: 'suggestion' | 'bug' | 'question' | 'other';
  content: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}