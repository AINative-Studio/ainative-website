# API Documentation Component

## Overview
Comprehensive API documentation viewer for the QNN platform, created for GitHub issue #129.

## File Location
`/Users/aideveloper/core/AINative-website/src/components/qnn/APIDocumentation.tsx`

## Features Implemented

### 5 Documentation Tabs
1. **Model Management API** - CRUD operations for quantum and classical models
2. **Training & Evaluation API** - Model training and performance evaluation
3. **Signing & Verification API** - Quantum signature operations
4. **Monitoring & Metrics API** - System monitoring and performance metrics
5. **Security Guidelines** - Comprehensive security best practices

### Endpoints Covered

#### Model Management (5 endpoints)
- `GET /api/v1/models` - List all models with filtering
- `GET /api/v1/models/{id}` - Get model details
- `POST /api/v1/models` - Create new model
- `PUT /api/v1/models/{id}` - Update model
- `DELETE /api/v1/models/{id}` - Delete model

#### Training & Evaluation (5 endpoints)
- `POST /api/v1/training/start` - Start training job
- `GET /api/v1/training/status/{job_id}` - Check training status
- `POST /api/v1/evaluation/start` - Start evaluation
- `GET /api/v1/evaluation/results/{job_id}` - Get evaluation results
- `POST /api/v1/features/extract` - Extract code features

#### Signing & Verification (3 endpoints)
- `POST /api/v1/signing/sign` - Sign model with quantum signature
- `POST /api/v1/signing/verify` - Verify quantum signature
- `GET /api/v1/signing/signatures/{model_id}` - List model signatures

#### Monitoring & Metrics (4 endpoints)
- `GET /api/v1/monitoring/metrics` - System and quantum metrics
- `GET /api/v1/monitoring/anomalies` - Detected anomalies
- `GET /api/v1/monitoring/devices` - Quantum device status
- `GET /api/v1/monitoring/costs` - Resource costs and usage

### Key Features

#### For Each Endpoint
- **HTTP Method Badge** - Color-coded (GET=blue, POST=green, PUT=yellow, DELETE=red)
- **Endpoint Path** - Displayed with syntax highlighting
- **Description** - Clear explanation of functionality
- **Parameters** - Organized by type:
  - Path parameters
  - Query parameters
  - Body parameters
- **Request Examples** - Three languages:
  - cURL
  - Python
  - JavaScript
- **Response Example** - JSON with syntax highlighting
- **Status Codes** - All possible HTTP status codes
- **Error Examples** - Sample error responses where applicable

#### Interactive Features
- **Search/Filter** - Search across all endpoints by path, method, or description
- **Copy Code Button** - One-click copy for all code examples
- **Collapsible Sections** - Each endpoint expands/collapses
- **Language Switcher** - Toggle between cURL, Python, JavaScript
- **Syntax Highlighting** - Dark mode code blocks using `react-syntax-highlighter`
- **Smooth Animations** - Framer Motion animations for interactions

#### Security Guidelines Tab
Comprehensive security documentation including:
- **Model Security Requirements**
  - Quantum signatures (CRYSTALS-Dilithium)
  - Parameter protection
  - Signature validation
- **API Security Best Practices**
  - Authentication best practices
  - Input sanitization
  - Rate limiting with exponential backoff
  - Access logging
- **Production-Ready Example**
  - Complete SecureQNNClient class
  - Full deployment workflow with security checks

### Technical Implementation

#### Dependencies Used
- `react-syntax-highlighter` - Code syntax highlighting
- `@radix-ui/react-tabs` - Tab navigation (shadcn/ui)
- `@radix-ui/react-collapsible` - Collapsible endpoint cards
- `framer-motion` - Smooth animations
- `lucide-react` - Modern icons
- All shadcn/ui components (Card, Badge, Button, Input, etc.)

#### Design Decisions
- **Stripe/Twilio-inspired styling** - Modern API documentation aesthetic
- **Color-coded HTTP methods** - Quick visual identification
- **Collapsible cards** - Reduce cognitive load
- **Multi-language examples** - Support diverse developer audiences
- **Real-world examples** - Production-ready code snippets
- **Comprehensive error handling** - Shows both success and failure cases

#### Component Structure
```typescript
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: {
    path?: Parameter[];
    query?: Parameter[];
    body?: Parameter[];
  };
  requestExample: {
    curl: string;
    python: string;
    javascript: string;
  };
  responseExample: string;
  statusCodes: StatusCode[];
  errorExample?: string;
}
```

### Usage Example

```tsx
import APIDocumentation from '@/components/qnn/APIDocumentation';

function QNNDashboard() {
  return (
    <div className="container mx-auto p-6">
      <APIDocumentation />
    </div>
  );
}
```

### Responsive Design
- Mobile-first approach
- Horizontal scrolling for tab navigation on mobile
- Vertical scrolling for endpoint lists (800px height)
- Touch-friendly interactive elements

### Accessibility
- Keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure
- High contrast for code blocks
- Screen reader compatible

### Performance Optimizations
- Lazy collapsible rendering (only renders expanded content)
- Search filtering on client-side (instant feedback)
- Memoized syntax highlighter styles
- Efficient state management with Set for open endpoints

## Files Modified/Created

### Created
- `/Users/aideveloper/core/AINative-website/src/components/qnn/APIDocumentation.tsx` (Main component)

### Dependencies Installed
- `react-syntax-highlighter` - Code syntax highlighting library
- `@types/react-syntax-highlighter` - TypeScript definitions

## Integration Notes

The component is self-contained and can be integrated into any page or dashboard:

1. Import the component
2. Add it to your page layout
3. Optionally wrap in a container for spacing
4. Works with existing theme provider for dark/light mode

## Future Enhancements (Optional)

- **Try It Out** - Interactive API tester with live requests
- **Rate Limit Indicator** - Show remaining API calls
- **Authentication Helper** - API key management UI
- **Code Generator** - Generate client libraries
- **Postman Collection Export** - Export endpoints to Postman
- **OpenAPI Spec Export** - Generate OpenAPI/Swagger spec

## Testing Recommendations

1. Test search functionality with various queries
2. Verify copy-to-clipboard works across browsers
3. Test collapsible behavior with multiple open endpoints
4. Validate syntax highlighting in both light and dark modes
5. Test responsive behavior on mobile devices
6. Verify tab navigation works smoothly
7. Test accessibility with keyboard-only navigation

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License
MIT (matches project license)
