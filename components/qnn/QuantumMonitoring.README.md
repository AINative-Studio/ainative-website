# Quantum System Monitoring Dashboard

## Overview

The Quantum System Monitoring dashboard provides comprehensive real-time monitoring of quantum computing resources, system health metrics, cost tracking, and anomaly detection. This component is designed for GitHub issue #129 and follows the QNN Project-Specific Coding Standards.

## Features

### 1. System Metrics Cards (Top Row)
- **CPU Usage**: Displays current CPU utilization with trend indicator
- **Memory Usage**: Shows memory consumption with trend indicator
- **Job Queue Length**: Tracks pending quantum jobs with trend indicator
- **Active Circuits**: Monitors currently running quantum circuits with trend indicator

Each metric card includes:
- Large, readable metric value
- Trend indicator (↑ up, ↓ down, - stable)
- Contextual description

### 2. Quantum Resource Usage
- Interactive pie chart showing resource distribution across quantum devices
- Hover tooltips with percentage breakdowns
- Animated transitions for smooth data updates
- Color-coded segments for easy identification

### 3. Cost Tracking
- **Daily Cost**: Current day's quantum computing expenses (USD)
- **Monthly Cost**: Month-to-date expenses (USD)
- **Projected Monthly Cost**: End-of-month projection with delta indicator
- **Cost by Device**: Bar chart showing cost breakdown per quantum device

Features:
- Real-time cost calculations
- Delta indicators showing increase/decrease trends
- Device-level cost attribution
- Interactive charts with tooltips

### 4. Quantum Device Status
- Grid layout displaying all available quantum devices
- Status badges (Online=green, Offline=red, Maintenance=yellow)
- Device metrics:
  - Queue length
  - Pending jobs
  - Backend version
  - Last update timestamp
- Animated card transitions
- Responsive grid layout (1-4 columns based on screen size)

### 5. System Alerts
- Scrollable list of system alerts
- Severity-coded alerts:
  - Error (red) - Critical system issues
  - Warning (yellow) - Important notifications
  - Info (blue) - General information
- Alert details:
  - Timestamp
  - Device attribution
  - Severity badge
- Dismissible alerts (click × to dismiss)
- Alert count badge
- Auto-scroll to critical alerts
- Empty state when no alerts

### 6. Anomaly Detection
- Current anomaly list with detailed information:
  - Metric name
  - Current value vs. expected range
  - Severity level (critical, high, medium, low)
  - Timestamp and device
  - Description
- Historical anomaly trend chart:
  - Multi-line chart showing anomaly counts over time
  - Breakdown by severity level
  - Interactive tooltips
- Empty state when no anomalies detected

## Technical Implementation

### API Integration

The component fetches data from two QNN API endpoints:

1. **Monitoring Metrics**: `/api/v1/monitoring/metrics`
   ```typescript
   {
     timestamp: string;
     system_metrics: SystemMetrics;
     quantum_metrics: QuantumMetrics;
     cost_metrics: CostMetrics;
     device_status: DeviceStatus[];
     alerts: SystemAlert[];
   }
   ```

2. **Anomaly Data**: `/api/v1/monitoring/anomalies`
   ```typescript
   {
     anomalies: Anomaly[];
     anomaly_history: AnomalyHistory[];
   }
   ```

### Auto-Refresh

- Data automatically refreshes every 30 seconds
- Manual refresh button available
- Loading states during refresh (no skeleton, just button animation)
- Last updated timestamp displayed

### Components Used

The dashboard leverages shadcn/ui components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button`
- `Badge`
- `Alert`, `AlertDescription`
- `Skeleton` (loading states)
- `ScrollArea` (alerts and anomalies)
- `Separator`

### Charting Library

Uses Recharts for data visualization:
- `PieChart` - Resource utilization
- `BarChart` - Cost by device
- `LineChart` - Anomaly history trend

### Icons

Lucide React icons used throughout:
- `Activity` - Main dashboard icon
- `Cpu`, `HardDrive`, `Clock`, `Zap` - Metric icons
- `DollarSign` - Cost tracking
- `AlertCircle`, `AlertTriangle`, `Info` - Alert types
- `RefreshCw` - Refresh action
- `Download` - Export action
- `Server` - Device representation
- `TrendingUp`, `TrendingDown`, `Minus` - Trend indicators
- `CheckCircle2`, `XCircle` - Status indicators

### Animations

Framer Motion provides smooth animations:
- Staggered children animation on mount
- Card transitions
- Alert dismissal animations
- Loading spinner rotation
- Hover effects

## Usage

### Basic Implementation

```tsx
import QuantumMonitoring from '@/components/qnn/QuantumMonitoring';

function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <QuantumMonitoring />
    </div>
  );
}
```

### With Error Boundary

```tsx
import QuantumMonitoring from '@/components/qnn/QuantumMonitoring';
import { QNNErrorBoundary } from '@/components/qnn/QNNErrorBoundary';

function DashboardPage() {
  return (
    <QNNErrorBoundary>
      <div className="container mx-auto p-6">
        <QuantumMonitoring />
      </div>
    </QNNErrorBoundary>
  );
}
```

## Features in Detail

### Export Metrics Report

Click the "Export Report" button to download a JSON file containing:
- Current monitoring data
- Anomaly data
- Timestamp
- Complete system state snapshot

The file is named: `quantum-monitoring-report-YYYY-MM-DD-HHmm.json`

### Alert Management

- **Dismiss**: Click the × button to dismiss an alert
- **Auto-scroll**: Critical alerts automatically scroll into view
- **Persistence**: Dismissed alerts remain hidden during the session

### Color Coding

Consistent color scheme throughout:
- **Primary** (#8b5cf6): Main accent color
- **Success** (#22c55e): Online status, positive trends
- **Warning** (#f59e0b): Maintenance status, warnings
- **Danger** (#ef4444): Offline status, errors, critical alerts
- **Info** (#3b82f6): Info alerts, medium severity
- **Chart Colors**: Distinct palette for multi-series charts

### Loading States

- **Initial Load**: Full skeleton grid while fetching data
- **Refresh**: Animated spinner on refresh button
- **Error State**: Red error card with retry button
- **Empty States**: Friendly messages when no data available

### Responsive Design

- **Mobile**: Single column layout, stacked cards
- **Tablet**: 2-column layout for most sections
- **Desktop**: 3-4 column layout for optimal space usage
- **4K**: Maximum 4 columns to prevent horizontal stretching

### Dark Mode Support

The component is fully compatible with dark mode:
- Color scheme adjusts automatically
- Chart themes follow system preference
- Border and background colors use CSS variables
- Text contrast maintained for accessibility

## Data Structure

### SystemMetrics
```typescript
interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  quantum_job_queue_length: number;
  active_circuits: number;
  cpu_trend?: 'up' | 'down' | 'stable';
  memory_trend?: 'up' | 'down' | 'stable';
  queue_trend?: 'up' | 'down' | 'stable';
  circuits_trend?: 'up' | 'down' | 'stable';
}
```

### QuantumMetrics
```typescript
interface QuantumMetrics {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  average_execution_time: number;
  resource_utilization: {
    [device: string]: number;
  };
}
```

### CostMetrics
```typescript
interface CostMetrics {
  daily_cost_usd: number;
  monthly_cost_usd: number;
  projected_monthly_cost_usd: number;
  cost_by_device: {
    [device: string]: number;
  };
}
```

### DeviceStatus
```typescript
interface DeviceStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  queue_length: number;
  last_update: string;
  backend_version?: string;
  pending_jobs?: number;
}
```

### SystemAlert
```typescript
interface SystemAlert {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  device?: string;
}
```

### Anomaly
```typescript
interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expected_range: [number, number];
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  device?: string;
  description?: string;
}
```

## Performance Considerations

- **Memoization**: Callbacks memoized with `useCallback`
- **Chart Performance**: Recharts uses canvas rendering for smooth animations
- **Scroll Optimization**: `ScrollArea` component handles large lists efficiently
- **Conditional Rendering**: Empty states and error boundaries prevent unnecessary renders
- **Data Polling**: 30-second interval balances real-time updates with server load

## Accessibility

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support for all actions
- **Color Contrast**: WCAG AA compliant color ratios
- **Screen Readers**: Semantic HTML and ARIA attributes
- **Focus Management**: Clear focus indicators
- **Dismissible Alerts**: Keyboard accessible (Enter/Space)

## Testing

Comprehensive test suite included (`QuantumMonitoring.test.tsx`):
- Component rendering
- System metrics display
- Cost tracking
- Device status
- Alerts and dismissal
- Anomaly detection
- User interactions
- Error handling
- Responsive design
- Animations

Run tests:
```bash
npm test -- QuantumMonitoring.test.tsx
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Dependencies

- React 18+
- Framer Motion 11+
- Recharts (via shadcn/ui chart component)
- Lucide React
- date-fns
- shadcn/ui components
- Tailwind CSS

## Troubleshooting

### Charts Not Rendering
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data format matches expected structure

### Auto-Refresh Not Working
- Check browser console for API errors
- Verify endpoints are accessible
- Ensure component is mounted (not unmounted during interval)

### Performance Issues
- Reduce refresh interval if needed
- Check for memory leaks in browser DevTools
- Verify API response times

## Future Enhancements

Potential improvements for future releases:
- WebSocket support for real-time updates
- Customizable refresh intervals
- User preferences for visible sections
- Advanced filtering and search
- Historical data comparison
- Export to PDF/CSV formats
- Custom alert rules
- Device health predictions
- Cost optimization recommendations

## References

- GitHub Issue: #129
- Reference Implementation: `/Users/aideveloper/core/qnn-app/ui/app.py` (Lines 710-928)
- QNN API Documentation: `/api/v1/monitoring/`
- Project Standards: QNN Project-Specific Coding Standards

## License

Part of the AINative Studio Core project.
