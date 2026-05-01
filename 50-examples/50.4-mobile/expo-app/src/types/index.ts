export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  author: User;
  tags: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  body: string;
  createdAt: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export interface NavItem {
  name: string;
  icon: string;
  label: string;
}

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  PostDetail: { postId: string };
  Profile: { userId?: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Notifications: undefined;
  MyProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export interface ListItemProps<T> {
  item: T;
  index: number;
  onPress?: (item: T) => void;
  onLongPress?: (item: T) => void;
}

export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}
