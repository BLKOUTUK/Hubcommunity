import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    points: 0,
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('handles successful login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });
  });

  it('handles failed login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid email or password'),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('handles logout', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('persists user in localStorage', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
  });

  it('loads user from localStorage on mount', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
  });

  it('handles invalid localStorage data', () => {
    localStorage.setItem('user', 'invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('provides user role', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      const { user } = useAuth();
      expect(user?.role).toBe('user');
    });
  });
});

// Test component to use the auth context
const TestComponent = () => {
  const { user, login, logout } = useAuth();

  return (
    <div>
      {user ? (
        <>
          <p>Logged in as: {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </>
      )}
    </div>
  );
}; 