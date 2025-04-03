# Community Dashboard

A community dashboard application built with React and TypeScript, featuring event integration and calendar management.

## Features

- Event scraping from external sources
- Calendar integration
- Admin access control
- Event validation and processing
- Modern, responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/community-dashboard.git
cd community-dashboard
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:
```bash
npm start
```

The application will be available at `http://localhost:5173`.

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory. Deploy these files to your hosting service.

### Deployment Options

#### Option 1: Static Hosting (e.g., Netlify, Vercel)
- Connect your repository to the hosting service
- Configure the build command as `npm run build`
- Set the publish directory as `dist`

#### Option 2: Manual Deployment
- Copy the contents of the `dist` directory to your web server
- Configure your web server to serve the files and handle client-side routing

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=your_api_url
VITE_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.