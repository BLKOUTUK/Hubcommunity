import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const TestComponent = () => {
    const { user, login, logout } = useAuth();
    
    return (
      <div>
        {user ? (
          <div>
            <p>Logged in as: {user.name}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div>
            <p>Not logged in</p>
            <button onClick={() => login('test@example.com', 'password')}>Login</button>
          </div>
        )}
      </div>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial null user state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
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
    // First login
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

    // Then logout
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('persists user in localStorage', async () => {
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
    localStorage.setItem('user', 'invalid json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('provides user role', async () => {
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