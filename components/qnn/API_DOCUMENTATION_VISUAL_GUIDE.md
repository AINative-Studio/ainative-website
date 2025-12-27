# API Documentation Component - Visual Guide

## 🎨 Component Preview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📚 QNN API Documentation                                               │
│  Comprehensive API reference with code examples and security guidelines │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Search endpoints...                                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  [Model Management] [Training & Evaluation] [Signing] [Monitoring] [🔐]│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  💻 Model Management                                                     │
│  Create, retrieve, update, and delete quantum and classical models      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔵 GET  /api/v1/models                                            ▶    │
│  Retrieves a list of all available models with filtering support        │
│                                                                          │
│  Expanded view:                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 Parameters                                                      │ │
│  │   Query Parameters                                                 │ │
│  │     page     integer  optional   Page number                       │ │
│  │     limit    integer  optional   Models per page                   │ │
│  │     type     string   optional   Filter by type                    │ │
│  │                                                                    │ │
│  │ 💻 Request Example      [curl] [Python] [JavaScript]  📋          │ │
│  │   import requests                                                  │ │
│  │                                                                    │ │
│  │   url = "https://api.qnn.com/api/v1/models"                       │ │
│  │   headers = {"Authorization": "Bearer YOUR_API_KEY"}              │ │
│  │   response = requests.get(url, headers=headers)                   │ │
│  │                                                                    │ │
│  │ 📤 Response Example                                    📋          │ │
│  │   {                                                                │ │
│  │     "success": true,                                               │ │
│  │     "data": [{                                                     │ │
│  │       "id": "model_abc123",                                        │ │
│  │       "name": "Quantum Classification Model",                      │ │
│  │       "type": "quantum",                                           │ │
│  │       "accuracy": 0.94                                             │ │
│  │     }]                                                             │ │
│  │   }                                                                │ │
│  │                                                                    │ │
│  │ ⚠️  Status Codes                                                   │ │
│  │   200  Success - Returns list of models                           │ │
│  │   400  Bad Request - Invalid parameters                           │ │
│  │   401  Unauthorized - Invalid API key                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🟢 POST  /api/v1/models                                           ▶    │
│  Creates a new quantum or classical model with specified parameters     │
└─────────────────────────────────────────────────────────────────────────┘

... (more endpoints)
```

## 🎯 User Flow Visualization

### 1. Landing on Page
```
User arrives → Sees header card → Reads description → Notices search bar
```

### 2. Exploring Tabs
```
Click tab → View category description → See list of endpoints → Scan methods
```

### 3. Finding Endpoint
```
Type in search → Results filter instantly → Click relevant endpoint → Expands
```

### 4. Viewing Code
```
See Python example → Click JavaScript → Code updates → Click copy → Copied!
```

### 5. Reading Details
```
Read parameters → Check response format → Review status codes → Note errors
```

## 🎨 Color Scheme Guide

### HTTP Method Colors
```
🔵 GET    - Blue      - Safe read operations
🟢 POST   - Green     - Create new resources
🟡 PUT    - Yellow    - Update existing resources
🔴 DELETE - Red       - Destructive operations
```

### Status Colors
```
✅ 200-299 - Success  - Green badges
⚠️  400-499 - Client  - Red badges
❌ 500-599 - Server  - Red badges
```

### UI Elements
```
Purple/Blue Gradient - Primary branding
Gray - Muted text and descriptions
White/Black - Background (theme dependent)
```

## 📱 Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────────┐
│  Full width tabs                                                 │
│  ┌─────┬─────┬─────┬─────┬─────┐                                │
│  │ Tab │ Tab │ Tab │ Tab │ Tab │                                │
│  └─────┴─────┴─────┴─────┴─────┘                                │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐│
│  │  Endpoint Card   │  │  Endpoint Details                   ││
│  │  [Method] Path   │  │  Parameters                         ││
│  └──────────────────┘  │  Code Examples                      ││
│                        │  Responses                          ││
│                        └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────┐
│  Scrollable tabs →                   │
│  ┌────┬────┬────┬───                 │
│  │Tab │Tab │Tab │...                 │
│  └────┴────┴────┴───                 │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Endpoint Card                 │ │
│  │  [Method] /path                │ │
│  │  ┌──────────────────────────┐ │ │
│  │  │  Details stack vertically│ │ │
│  │  └──────────────────────────┘ │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────┐
│  [Tab▼]             │
│  ┌─────────────────┐│
│  │  Card           ││
│  │  GET            ││
│  │  /api/v1/models ││
│  │  ┌────────────┐ ││
│  │  │  Stacked   │ ││
│  │  │  Content   │ ││
│  │  └────────────┘ ││
│  └─────────────────┘│
└─────────────────────┘
```

## 🎬 Animation Flow

### Page Load
```
1. Header fades in from top (0.5s)
2. Search bar appears (0.3s delay)
3. Tabs slide in from left (0.4s delay)
4. Content fades in (0.5s delay)
```

### Endpoint Expansion
```
1. User clicks endpoint header
2. Chevron rotates 90° (0.2s)
3. Content slides down (0.3s)
4. Smooth ease-in-out animation
```

### Copy Button
```
1. User clicks copy button
2. Icon changes to check ✓ (instant)
3. Code copied to clipboard
4. After 2s, icon reverts to copy
```

### Language Switch
```
1. User clicks language button
2. Button background changes (instant)
3. Code block content updates (instant)
4. Smooth syntax re-highlighting
```

## 🖱️ Interactive Elements

### Clickable Areas
```
┌─────────────────────────────────┐
│  🔵 GET  /api/v1/models    ▶   │ ← Click anywhere to expand
│  Description text here          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  [curl] [Python] [JavaScript]   │ ← Click to switch language
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Code example...           📋   │ ← Click to copy
└─────────────────────────────────┘
```

### Hover States
```
Endpoint Card:    Border color intensifies
Copy Button:      Background lightens
Language Button:  Background appears
Tab:             Underline appears
```

## 📊 Content Hierarchy

### Level 1: Page Header
```
📚 QNN API Documentation (Largest text)
```

### Level 2: Category Headers
```
💻 Model Management
Training & Evaluation
🔐 Signing & Verification
```

### Level 3: Endpoint Paths
```
/api/v1/models
/api/v1/training/start
```

### Level 4: Section Titles
```
Parameters
Request Example
Response Example
Status Codes
```

### Level 5: Body Text
```
Descriptions, parameter details, code examples
```

## 🔍 Search Visualization

### Empty State
```
┌─────────────────────────────────┐
│  🔍 Search endpoints...         │
└─────────────────────────────────┘

All endpoints visible (17 total)
```

### Typing "POST"
```
┌─────────────────────────────────┐
│  🔍 POST                        │
└─────────────────────────────────┘

Filtered results (7 POST endpoints)
```

### Typing "training"
```
┌─────────────────────────────────┐
│  🔍 training                    │
└─────────────────────────────────┘

Filtered results (2 training endpoints)
```

### No Results
```
┌─────────────────────────────────┐
│  🔍 xyz123                      │
└─────────────────────────────────┘

No endpoints match (empty state)
```

## 🎨 Code Block Styling

### Dark Mode (Default)
```python
# Dark background (#1e1e1e)
# Syntax colors:
import requests  # Purple

url = "https://api.qnn.com"  # Green string
headers = {  # White braces
    "Authorization": "Bearer KEY"  # Orange key, green value
}

response = requests.get(url)  # Blue method
```

### Light Mode (Optional)
```python
# Light background (#f5f5f5)
# Syntax colors:
import requests  # Dark purple

url = "https://api.qnn.com"  # Dark green
headers = {  # Dark gray
    "Authorization": "Bearer KEY"  # Dark orange
}

response = requests.get(url)  # Dark blue
```

## 📋 Copy Button States

### Default State
```
┌──────┐
│  📋  │  Copy icon, gray
└──────┘
```

### Hover State
```
┌──────┐
│  📋  │  Copy icon, background appears
└──────┘
```

### Copied State (2s)
```
┌──────┐
│  ✓   │  Check icon, green
└──────┘
```

## 🎯 Tab Navigation Flow

```
User Journey:

1. Start → Model Management (default)
   ↓
2. Explore → Training & Evaluation
   ↓
3. Learn → Signing & Verification
   ↓
4. Monitor → Monitoring & Metrics
   ↓
5. Secure → Security Guidelines
```

## 🔐 Security Tab Layout

```
┌─────────────────────────────────────────────────────┐
│  🔐 Security Guidelines                             │
│  Essential security practices for QNN API           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Model Security Requirements                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔑 Quantum Signatures                      │   │
│  │  CRYSTALS-Dilithium implementation          │   │
│  │  [Code example with copy button]            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🛡️  Parameter Protection                   │   │
│  │  Hashed parameter storage                   │   │
│  │  [Code example with copy button]            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

... (more sections)
```

## 💻 Code Example Languages

### Language Switcher Position
```
┌─────────────────────────────────────────────────────┐
│  💻 Request Example                                 │
│                            [curl] [Python] [JS]  📋 │
│  ┌───────────────────────────────────────────────┐  │
│  │  import requests                              │  │
│  │  ...                                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Language Toggle Behavior
```
Click cURL:
  ┌───────────────────┐
  │ curl -X GET ...   │
  └───────────────────┘

Click Python:
  ┌───────────────────┐
  │ import requests   │
  │ response = ...    │
  └───────────────────┘

Click JavaScript:
  ┌───────────────────┐
  │ const response    │
  │   = await fetch   │
  └───────────────────┘
```

## 🎯 Best Practices for Users

### Efficient Navigation
```
1. Use search for specific endpoints
2. Use tabs to browse by category
3. Expand only needed endpoints
4. Copy code with one click
5. Switch languages as needed
```

### Reading Flow
```
1. Read endpoint description
2. Check parameters needed
3. View request example
4. Check response format
5. Note status codes
6. Review error cases
```

## 📱 Touch Interactions (Mobile)

```
Tap:        Expand/collapse endpoint
Long press: (none - not implemented)
Swipe:      Scroll tab list horizontally
Pinch:      Browser zoom (default)
```

## ✨ Visual Feedback

### Actions with Feedback
```
✅ Click copy      → Check icon appears
✅ Expand card     → Chevron rotates
✅ Switch language → Button highlights
✅ Type in search  → Results update
✅ Hover button    → Background appears
```

### Actions without Feedback
```
❌ Scroll           → (Browser default)
❌ Select text      → (Browser default)
```

## 🎨 Component States

### Loading (Initial)
```
┌─────────────────┐
│  Loading...     │
│  [Skeleton UI]  │
└─────────────────┘
```

### Loaded
```
┌─────────────────┐
│  Full content   │
│  All endpoints  │
└─────────────────┘
```

### Searching
```
┌─────────────────┐
│  🔍 "training"  │
│  Filtered (2)   │
└─────────────────┘
```

### No Results
```
┌─────────────────┐
│  No matches     │
│  Try different  │
│  search term    │
└─────────────────┘
```

## 🎯 Key Takeaways

1. **Clean Layout** - Card-based design with clear hierarchy
2. **Interactive** - Copy buttons, collapsible sections, language switcher
3. **Searchable** - Real-time filtering across all content
4. **Responsive** - Works on all screen sizes
5. **Accessible** - Keyboard navigation, ARIA labels, semantic HTML
6. **Modern** - Stripe/Twilio-inspired aesthetic
7. **Complete** - 17 endpoints, 51 code examples, security guidelines

---

**Created for GitHub Issue #129**
**Component:** `/Users/aideveloper/core/AINative-website/src/components/qnn/APIDocumentation.tsx`
