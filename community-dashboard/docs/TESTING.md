# Testing Strategy

This document outlines the testing strategy and best practices for the Community Dashboard project.

## Overview

The Community Dashboard uses a comprehensive testing approach to ensure code quality, prevent regressions, and maintain a robust application. Our testing strategy includes:

1. Unit Testing
2. Integration Testing
3. Component Testing
4. End-to-End Testing (future implementation)

## Technologies Used

- **Jest**: Fast and feature-rich testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: Simulate user interactions
- **jsdom**: DOM environment for testing browser-like functionality

## Test Types

### Unit Tests

Unit tests focus on testing individual functions, hooks, and utilities in isolation.

**Example:**

```typescript
// src/utils/__tests__/formatDate.test.ts
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-01-15');
    expect(formatDate(date)).toBe('January 15, 2023');
  });

  it('handles invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
  });
});
```

### Component Tests

Component tests verify that UI components render correctly and respond appropriately to user interactions.

**Example:**

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Integration tests check how multiple components or services work together.

**Example:**

```typescript
// src/pages/__tests__/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

describe('Dashboard Integration', () => {
  it('loads and displays engagement metrics', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('New Members')).toBeInTheDocument();
    expect(screen.getByText('Content Pieces')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Feedback Responses')).toBeInTheDocument();
  });
});
```

## Test Organization

Tests are organized following the same structure as the source code:

- **Unit tests**: Located alongside the code they test with a `.test.ts` or `.test.tsx` suffix
- **Component tests**: Located in `__tests__` directories next to the components they test
- **Integration tests**: Located in `__tests__` directories in the relevant feature directories

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# View coverage report
npm run test:coverage-report

# Find files missing tests
npm run test:missing
```

## Test Coverage

We aim for high test coverage to ensure code quality:

- **Statements**: 80% minimum
- **Branches**: 70% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum

Coverage reports are generated in the `coverage` directory and can be viewed by opening `coverage/index.html` in a browser.

## Mocking

### Mocking Components

```typescript
jest.mock('../ComponentToMock', () => ({
  ComponentToMock: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mocked-component">{children}</div>
  ),
}));
```

### Mocking Hooks

```typescript
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { id: '123', name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
```

### Mocking API Calls

```typescript
jest.mock('../api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked data' }),
}));
```

## Testing Asynchronous Code

```typescript
it('loads data asynchronously', async () => {
  render(<AsyncComponent />);
  
  // Wait for loading state to disappear
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await screen.findByText('Data loaded');
  
  // Assert on loaded state
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

## Testing Error States

```typescript
it('handles errors gracefully', async () => {
  // Mock API to throw an error
  jest.mock('../api', () => ({
    fetchData: jest.fn().mockRejectedValue(new Error('API Error')),
  }));
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's implemented
2. **Use Realistic Data**: Test with data that resembles what will be used in production
3. **Test Edge Cases**: Include tests for error states, empty states, and boundary conditions
4. **Keep Tests Independent**: Each test should be able to run independently of others
5. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
6. **Avoid Testing Implementation Details**: Test the public API of components, not internal state
7. **Use Test Driven Development (TDD)**: Write tests before implementing features when possible
8. **Maintain Test Quality**: Refactor tests as the codebase evolves

## Continuous Integration

Tests are automatically run in the CI pipeline on every push and pull request. The workflow is defined in `.github/workflows/ci.yml`.

## Finding Files Without Tests

Use the `test:missing` script to identify files that don't have corresponding test files:

```bash
npm run test:missing
```

This will output a list of files that need tests, helping to ensure comprehensive test coverage.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event Documentation](https://testing-library.com/docs/user-event/intro)