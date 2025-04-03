# Embedding Community Dashboard in Notion

This guide explains how to deploy the Community Dashboard and embed it in a Notion page.

## Deployment Options

### 1. Static Hosting (Recommended for Notion)

For embedding in Notion, the simplest approach is to deploy the dashboard as a static app on a service like Netlify, Vercel, or GitHub Pages.

#### Deploy to Netlify

1. Create a production build:
   ```bash
   cd community-dashboard
   npm run build
   ```

2. Deploy using Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. Follow the prompts and specify the `dist` directory when asked for the publish directory.

4. Netlify will provide a unique URL for your deployed dashboard.

#### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd community-dashboard
   vercel --prod
   ```

3. Follow the prompts to complete the deployment.

### 2. Self-Hosted Options

If you prefer to self-host, you can:
- Deploy to a VPS using Docker
- Host on your own server using Nginx or Apache

## Embedding in Notion

### Method 1: Embed Website Block

1. Open your Notion page
2. Type `/embed` and select "Embed"
3. Paste the URL of your deployed dashboard
4. Click "Embed link"

![Notion Embed](https://notion-emojis.s3-us-west-2.amazonaws.com/prod/svg-twitter/1f517.svg)

### Method 2: Iframe Embed in Code Block

For more control over the embedding:

1. Create a Code Block in Notion (type `/code` and select "Code")
2. Select "HTML" as the language
3. Paste the following code:

```html
<iframe 
  src="YOUR_DASHBOARD_URL" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>
```

4. Replace `YOUR_DASHBOARD_URL` with your actual deployed URL

### Method 3: Using a Notion Widget Service

For enhanced integration, you can use dedicated Notion widget services:

1. [Notion2Charts](https://notion2charts.com/)
2. [Indify](https://indify.co/)
3. [Super](https://super.so/)

These services provide additional features for embedding interactive content in Notion.

## Authentication Considerations

When embedding the dashboard in Notion:

1. **Public Access**: If the dashboard should be publicly accessible, configure it without authentication.

2. **Protected Access**: If you need authentication:
   - Use JWT tokens and allow for a special "embed mode" token
   - Configure CORS to allow embedding from specific domains
   - Implement a simplified login process or use API keys for embedded views

## Optimizing for Embedded View

For better integration in Notion:

1. Edit `community-dashboard/src/App.tsx` to detect embedded mode:

```tsx
// Add detection for embedded mode
const isEmbedded = window.location.search.includes('embed=true');

// Then use this to conditionally render a more compact UI
return (
  <div className={`app ${isEmbedded ? 'embedded-mode' : ''}`}>
    {!isEmbedded && <Header />}
    <main className={isEmbedded ? 'embedded-content' : ''}>
      {/* Main content */}
    </main>
    {!isEmbedded && <Footer />}
  </div>
);
```

2. Add CSS styles for embedded mode in `community-dashboard/src/index.css`:

```css
/* Embedded mode styles */
.embedded-mode {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.embedded-content {
  padding: 10px;
  height: 100vh;
  overflow: auto;
}
```

3. Use the URL parameter in your deployment: `https://your-dashboard-url.netlify.app/?embed=true`

## Example Code for Customized Embedded View

You can create a dedicated component for embedded view:

```tsx
// src/components/EmbeddedView.tsx
import React from 'react';
import { EngagementTracking } from '../pages/EngagementTracking';

const EmbeddedView: React.FC = () => {
  return (
    <div className="embedded-container">
      <EngagementTracking />
    </div>
  );
};

export default EmbeddedView;
```

Then update your routing to handle embedded view separately.

## Troubleshooting Embedding Issues

### Issue: X-Frame-Options Blocking

If Notion shows "Refused to display in a frame because it set 'X-Frame-Options'":

1. Add appropriate headers to your deployment:
   ```
   X-Frame-Options: ALLOW-FROM https://www.notion.so
   Content-Security-Policy: frame-ancestors 'self' https://www.notion.so
   ```

2. In Netlify, create a `_headers` file in your `public` directory:
   ```
   /*
     X-Frame-Options: ALLOW-FROM https://www.notion.so
     Content-Security-Policy: frame-ancestors 'self' https://www.notion.so
   ```

### Issue: Authentication Problems

For embedded views with authentication:
1. Consider using URL parameters for simplified auth
2. Create special embed-only views that require limited authentication
3. Use localStorage to persist authentication tokens