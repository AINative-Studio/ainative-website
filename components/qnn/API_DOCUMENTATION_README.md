# QNN API Documentation Component

## Quick Start

```tsx
import APIDocumentation from '@/components/qnn/APIDocumentation';

function YourPage() {
  return <APIDocumentation />;
}
```

## Overview

A comprehensive, production-ready API documentation viewer built for the QNN platform. Features interactive code examples, search functionality, and modern UI inspired by Stripe and Twilio documentation.

**Created for:** GitHub Issue #129
**Component Location:** `/Users/aideveloper/core/AINative-website/src/components/qnn/APIDocumentation.tsx`

## Features

### Documentation Coverage
- **17 API Endpoints** across 4 categories
- **3 Language Examples** (cURL, Python, JavaScript) for each endpoint
- **Real-world Code Samples** with production-ready patterns
- **Comprehensive Security Guidelines** with code examples

### Interactive Features
- **Search & Filter** - Search across all endpoints
- **Copy Code Buttons** - One-click copy for all examples
- **Collapsible Endpoints** - Reduce cognitive load
- **Language Switcher** - Toggle between cURL/Python/JavaScript
- **Syntax Highlighting** - Dark mode code blocks
- **Smooth Animations** - Framer Motion transitions

### Design
- Stripe/Twilio-inspired modern aesthetic
- Color-coded HTTP method badges
- Responsive mobile-first layout
- Dark mode optimized
- Accessibility compliant

## Installation

The component requires these dependencies (already installed):

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

## API Categories

### 1. Model Management (5 endpoints)
```
GET    /api/v1/models           - List all models
GET    /api/v1/models/{id}      - Get model details
POST   /api/v1/models           - Create model
PUT    /api/v1/models/{id}      - Update model
DELETE /api/v1/models/{id}      - Delete model
```

### 2. Training & Evaluation (5 endpoints)
```
POST /api/v1/training/start              - Start training job
GET  /api/v1/training/status/{job_id}    - Check training status
POST /api/v1/evaluation/start            - Start evaluation
GET  /api/v1/evaluation/results/{job_id} - Get evaluation results
POST /api/v1/features/extract            - Extract code features
```

### 3. Signing & Verification (3 endpoints)
```
POST /api/v1/signing/sign                  - Sign model
POST /api/v1/signing/verify                - Verify signature
GET  /api/v1/signing/signatures/{model_id} - List signatures
```

### 4. Monitoring & Metrics (4 endpoints)
```
GET /api/v1/monitoring/metrics    - System metrics
GET /api/v1/monitoring/anomalies  - Detected anomalies
GET /api/v1/monitoring/devices    - Device status
GET /api/v1/monitoring/costs      - Resource costs
```

## Usage Examples

### Basic Integration

```tsx
import APIDocumentation from '@/components/qnn/APIDocumentation';

function DocumentationPage() {
  return (
    <div className="container mx-auto p-6">
      <APIDocumentation />
    </div>
  );
}
```

### With Page Layout

```tsx
import APIDocumentation from '@/components/qnn/APIDocumentation';

function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">API Documentation</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <APIDocumentation />
      </main>
    </div>
  );
}
```

### In Dashboard

```tsx
import APIDocumentation from '@/components/qnn/APIDocumentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Dashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="docs">API Docs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* Dashboard content */}
      </TabsContent>

      <TabsContent value="docs">
        <APIDocumentation />
      </TabsContent>
    </Tabs>
  );
}
```

### With Router

```tsx
// React Router example
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import APIDocumentation from '@/components/qnn/APIDocumentation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/docs" element={<APIDocumentation />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Component Props

The component is self-contained and doesn't require props. It manages its own state internally.

```tsx
interface APIDocumentationProps {
  // No props required - component is self-contained
}
```

## State Management

The component maintains internal state for:
- Search query
- Selected language (cURL/Python/JavaScript)
- Open/closed endpoint states
- Copied code feedback
- Dark mode preference

## Customization

### Theme Integration

The component respects your application's theme:

```tsx
// It automatically uses theme colors from your CSS variables
// Defined in your globals.css or tailwind.config.js
```

### Custom Styling

Wrap the component to apply custom styles:

```tsx
<div className="custom-docs-container">
  <APIDocumentation />
</div>

// Custom CSS
.custom-docs-container {
  max-width: 1400px;
  margin: 0 auto;
}
```

## Code Examples

Each endpoint includes three language examples:

### cURL
```bash
curl -X GET "https://api.qnn.com/api/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Python
```python
import requests

response = requests.get(
    "https://api.qnn.com/api/v1/models",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
```

### JavaScript
```javascript
const response = await fetch('https://api.qnn.com/api/v1/models', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
```

## Security Tab

The Security Guidelines tab includes:

1. **Model Security Requirements**
   - Quantum signature implementation
   - Parameter protection patterns
   - Signature validation workflow

2. **API Security Best Practices**
   - Authentication methods
   - Input sanitization
   - Rate limiting strategies
   - Access logging

3. **Production-Ready Examples**
   - Complete SecureQNNClient class
   - Error handling patterns
   - Deployment verification workflow

## Search Functionality

Users can search for:
- Endpoint paths (e.g., "models", "training")
- HTTP methods (e.g., "GET", "POST")
- Descriptions (e.g., "signature", "evaluation")

```tsx
// Search is handled internally
// Results update in real-time as user types
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lazy Rendering** - Only expanded endpoints render details
- **Efficient Search** - Client-side filtering with instant feedback
- **Optimized Bundle** - Code splitting via dynamic imports
- **Smooth Animations** - 60fps Framer Motion transitions

## Accessibility

- Keyboard navigation support
- ARIA labels on all interactive elements
- Semantic HTML structure
- High contrast code blocks
- Screen reader compatible

## Testing

### Manual Testing Checklist

```bash
✅ Search functionality works across all tabs
✅ Copy buttons copy correct code
✅ Collapsible cards expand/collapse smoothly
✅ Language switcher changes all code examples
✅ All tabs load and display correctly
✅ Responsive on mobile devices
✅ Keyboard navigation works
✅ Code syntax highlighting renders
```

### Automated Testing (Future)

```tsx
// Example test structure
describe('APIDocumentation', () => {
  it('renders all 5 tabs', () => {});
  it('filters endpoints on search', () => {});
  it('copies code to clipboard', () => {});
  it('switches between languages', () => {});
});
```

## Troubleshooting

### Code blocks not highlighting

```bash
# Reinstall syntax highlighter
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### Copy button not working

```tsx
// Ensure clipboard API is available (HTTPS required)
if (!navigator.clipboard) {
  console.error('Clipboard API not available');
}
```

### Slow performance with many open endpoints

```tsx
// Close unused endpoints
// Component automatically manages open state
// Consider limiting max open endpoints if needed
```

## File Structure

```
src/components/qnn/
├── APIDocumentation.tsx          # Main component (2000+ lines)
├── APIDocumentation.demo.tsx     # Demo/integration examples
├── APIDocumentation.md           # Component documentation
└── API_DOCUMENTATION_README.md   # This file
```

## Contributing

To add new endpoints:

1. Add to the appropriate category in `apiCategories` array
2. Include all fields: method, path, description, parameters, examples
3. Provide cURL, Python, and JavaScript examples
4. Include response examples and status codes
5. Test search functionality with new content

Example:

```tsx
{
  method: 'GET',
  path: '/api/v1/new-endpoint',
  description: 'Description here',
  parameters: { /* ... */ },
  requestExample: {
    curl: '...',
    python: '...',
    javascript: '...'
  },
  responseExample: '...',
  statusCodes: [/* ... */]
}
```

## License

MIT (matches project license)

## Support

For issues or questions:
- GitHub Issues: [AINative-Studio/core/issues](https://github.com/AINative-Studio/core/issues)
- Email: support@ainative.com

## Related Files

- Reference: `/Users/aideveloper/core/qnn-app/ui/app.py` (Lines 1187-1563)
- Issue: https://github.com/AINative-Studio/core/issues/129

## Version

Current Version: 1.0.0
Last Updated: 2025-10-29
