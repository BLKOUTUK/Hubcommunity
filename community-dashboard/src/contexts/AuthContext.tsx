import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type for the three authorized users
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
};

// Define the context type
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false
});

// List of authorized users (in a real app, this would be stored securely on the server)
const AUTHORIZED_USERS: Record<string, { password: string; name: string; role: 'admin' | 'editor' | 'viewer' }> = {
  'admin': { 
    password: 'blkout-admin-2025', 
    name: 'Admin User',
    role: 'admin'
  },
  'editor': { 
    password: 'blkout-editor-2025', 
    name: 'Content Editor',
    role: 'editor'
  },
  'viewer': { 
    password: 'blkout-viewer-2025', 
    name: 'Data Viewer',
    role: 'viewer'
  }
};

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to hold the current user
  const [user, setUser] = useState<User | null>(null);
  
  // Check for existing login when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('dashboardUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
        localStorage.removeItem('dashboardUser');
      }
    }
  }, []);
  
  // Login function
  const login = (username: string, password: string): boolean => {
    // Check if username exists and password matches
    if (
      AUTHORIZED_USERS[username] && 
      AUTHORIZED_USERS[username].password === password
    ) {
      // Create user object
      const userObj: User = {
        id: username,
        name: AUTHORIZED_USERS[username].name,
        email: '',
        role: AUTHORIZED_USERS[username].role
      };
      
      // Store in state
      setUser(userObj);
      
      // Store in localStorage
      localStorage.setItem('dashboardUser', JSON.stringify(userObj));
      
      return true;
    }
    
    return false;
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('dashboardUser');
  };
  
  // Provide the context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'viewer' 
}) => {
  const { user } = useAuth();
  
  // Check if user is authenticated
  if (!user) {
    // Redirect to login
    return <LoginRedirect />;
  }
  
  // Check if user has required role
  const roleLevel = { admin: 3, editor: 2, viewer: 1 };
  if (roleLevel[user.role] < roleLevel[requiredRole]) {
    // User doesn't have sufficient permissions
    return <AccessDenied />;
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
};

// Helper components for redirection/access denied
const LoginRedirect: React.FC = () => {
  // In a real application, use React Router's Navigate
  useEffect(() => {
    window.location.href = '/login';
  }, []);
  
  return <div>Redirecting to login...</div>;
};

const AccessDenied: React.FC = () => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
      <p className="text-gray-700">You don't have permission to access this page.</p>
    </div>
  );
};