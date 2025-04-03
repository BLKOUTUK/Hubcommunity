# Error Logging and Monitoring

This document outlines the error logging and monitoring system implemented in the Community Dashboard project.

## Overview

The Community Dashboard uses a comprehensive error logging system to:

1. Capture and report errors in production
2. Provide meaningful error messages to users
3. Track error trends and patterns
4. Facilitate debugging and issue resolution

## Technologies Used

- **Sentry**: Cloud-based error monitoring service
- **React Error Boundary**: Component-level error catching
- **Custom Error Logging Service**: Centralized error handling

## Setup

### Sentry Configuration

1. Create a `.env` file in the project root (use `.env.example` as a template)
2. Add your Sentry DSN:
   ```
   VITE_SENTRY_DSN=your_sentry_dsn_here
   ```

### Environment-Specific Behavior

- **Development**: Errors are logged to the console with detailed information
- **Production**: Errors are reported to Sentry with contextual information

## Usage

### Logging Errors

Use the `logError` function from the error logging service:

```typescript
import { logError } from '../services/errorLogging';

try {
  // Code that might throw an error
} catch (error) {
  logError(error as Error, { 
    context: 'Additional information about where the error occurred',
    userId: '123', // Any relevant context
  });
}
```

### Logging Messages

Use the `logMessage` function for non-error information:

```typescript
import { logMessage } from '../services/errorLogging';

// Log an informational message
logMessage('User completed onboarding process', 'info', { userId: '123' });

// Log a warning
logMessage('API rate limit approaching threshold', 'warning', { endpoint: '/api/users' });

// Log an error message without an Error object
logMessage('Failed to load user data', 'error', { userId: '123' });
```

### User Context

Set user information to associate errors with specific users:

```typescript
import { setUser, clearUser } from '../services/errorLogging';

// When user logs in
setUser({
  id: '123',
  email: 'user@example.com',
  username: 'johndoe'
});

// When user logs out
clearUser();
```

## Error Boundaries

React Error Boundaries are used to catch errors in the component tree and display fallback UIs:

```tsx
import { AppErrorBoundary } from '../components/ErrorBoundary';

function MyComponent() {
  return (
    <AppErrorBoundary>
      {/* Your component content */}
    </AppErrorBoundary>
  );
}
```

The main application is already wrapped with an error boundary in `main.tsx`.

## Testing Error Handling

To test error handling, you can:

1. Throw intentional errors in development
2. Use the browser console to verify error logging
3. Check Sentry dashboard for reported errors in production

Example test for error handling:

```typescript
import { logError } from '../services/errorLogging';

describe('Error Logging', () => {
  it('should log errors correctly', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    
    logError(error, { context: 'test' });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
    consoleSpy.mockRestore();
  });
});
```

## Best Practices

1. **Be Specific**: Include relevant context with errors
2. **Avoid PII**: Don't log personally identifiable information
3. **Categorize Errors**: Use appropriate error levels (info, warning, error)
4. **Handle Async Errors**: Use try/catch in async functions and Promise chains
5. **User-Friendly Messages**: Show helpful error messages to users

## Monitoring and Alerts

In production, set up Sentry alerts for:

- New error types
- Error rate spikes
- Critical errors in core functionality

## Troubleshooting

If error logging isn't working:

1. Check that Sentry DSN is correctly configured
2. Verify that error boundaries are properly implemented
3. Ensure the error logging service is initialized in `main.tsx`
4. Check browser console for any initialization errors