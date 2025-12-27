# Quantum Monitoring Dashboard - Quick Start Guide

## 5-Minute Setup

### 1. Import the Component
```tsx
import QuantumMonitoring from '@/components/qnn/QuantumMonitoring';
```

### 2. Add to Your Page
```tsx
export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <QuantumMonitoring />
    </div>
  );
}
```

### 3. Done!
The component is fully self-contained and will:
- Auto-fetch data from `/api/v1/monitoring/metrics` and `/api/v1/monitoring/anomalies`
- Auto-refresh every 30 seconds
- Handle loading, error, and empty states
- Display all monitoring sections

## What You Get

### Dashboard Sections
1. **System Metrics** - CPU, Memory, Queue, Circuits (top row)
2. **Resource Usage** - Pie chart of quantum device utilization
3. **Cost Tracking** - Daily, monthly, projected costs + device breakdown
4. **Device Status** - All quantum devices with status badges
5. **System Alerts** - Dismissible alerts with severity levels
6. **Anomaly Detection** - Current anomalies + historical trend

### Interactive Features
- ✓ Refresh button
- ✓ Export report button (JSON download)
- ✓ Dismissible alerts
- ✓ Hover tooltips on charts
- ✓ Auto-scroll to critical alerts
- ✓ Trend indicators

## API Requirements

### Endpoint 1: Monitoring Metrics
**GET** `/api/v1/monitoring/metrics`

```json
{
  "timestamp": "2025-10-29T10:00:00Z",
  "system_metrics": {
    "cpu_usage": 45.5,
    "memory_usage": 62.3,
    "quantum_job_queue_length": 12,
    "active_circuits": 5,
    "cpu_trend": "up",
    "memory_trend": "stable",
    "queue_trend": "down",
    "circuits_trend": "up"
  },
  "quantum_metrics": {
    "total_jobs": 1250,
    "completed_jobs": 1180,
    "failed_jobs": 70,
    "average_execution_time": 2.5,
    "resource_utilization": {
      "ibm_brisbane": 35.2,
      "ibm_kyoto": 28.7
    }
  },
  "cost_metrics": {
    "daily_cost_usd": 125.50,
    "monthly_cost_usd": 3456.78,
    "projected_monthly_cost_usd": 3890.45,
    "cost_by_device": {
      "ibm_brisbane": 1200.50,
      "ibm_kyoto": 980.25
    }
  },
  "device_status": [
    {
      "name": "ibm_brisbane",
      "status": "online",
      "queue_length": 3,
      "last_update": "2025-10-29T09:58:00Z",
      "backend_version": "v1.2.3",
      "pending_jobs": 5
    }
  ],
  "alerts": [
    {
      "id": "alert-1",
      "severity": "error",
      "message": "High CPU usage detected",
      "timestamp": "2025-10-29T09:45:00Z",
      "device": "ibm_brisbane"
    }
  ]
}
```

### Endpoint 2: Anomaly Data
**GET** `/api/v1/monitoring/anomalies`

```json
{
  "anomalies": [
    {
      "id": "anomaly-1",
      "metric": "circuit_execution_time",
      "value": 5.8,
      "expected_range": [2.0, 4.0],
      "severity": "high",
      "timestamp": "2025-10-29T09:40:00Z",
      "device": "ibm_brisbane",
      "description": "Circuit execution time exceeds expected range"
    }
  ],
  "anomaly_history": [
    {
      "date": "2025-10-22",
      "count": 5,
      "critical": 1,
      "high": 2,
      "medium": 1,
      "low": 1
    }
  ]
}
```

## Common Customizations

### Custom Container
```tsx
<div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
  <div className="container mx-auto p-6">
    <QuantumMonitoring />
  </div>
</div>
```

### With Error Boundary
```tsx
import { QNNErrorBoundary } from '@/components/qnn/QNNErrorBoundary';

<QNNErrorBoundary>
  <QuantumMonitoring />
</QNNErrorBoundary>
```

### In a Tab
```tsx
<Tabs defaultValue="monitoring">
  <TabsList>
    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
    <TabsTrigger value="jobs">Jobs</TabsTrigger>
  </TabsList>
  <TabsContent value="monitoring">
    <QuantumMonitoring />
  </TabsContent>
</Tabs>
```

## Troubleshooting

### Charts Not Showing
**Issue**: Pie chart or bar charts are blank
**Solution**: Verify API returns data in correct format with numeric values

### API Errors
**Issue**: "Error Loading Monitoring Data"
**Solution**: Check browser console for CORS or network errors

### Slow Performance
**Issue**: Dashboard feels sluggish
**Solution**: Check API response time (should be < 500ms)

### Refresh Not Working
**Issue**: Auto-refresh stops working
**Solution**: Check browser console for errors, ensure component is mounted

## Tips & Tricks

### Development Mode
Use mock data during development:
```tsx
const [useMockData] = useState(process.env.NODE_ENV === 'development');
```

### Custom Refresh Interval
Modify the constant in the component:
```tsx
const REFRESH_INTERVAL = 60000; // 60 seconds
```

### Disable Auto-Refresh
Comment out the interval in useEffect:
```tsx
// const interval = setInterval(() => { ... }, REFRESH_INTERVAL);
```

### Custom API Endpoints
Update the fetch URLs:
```tsx
const response = await fetch('/custom/api/monitoring');
```

## Resources

- **Full Documentation**: `QuantumMonitoring.README.md`
- **Usage Examples**: `QuantumMonitoring.example.tsx`
- **Test Suite**: `__tests__/QuantumMonitoring.test.tsx`
- **Implementation Details**: `QUANTUM_MONITORING_IMPLEMENTATION.md`

## Need Help?

1. Check the full documentation in `QuantumMonitoring.README.md`
2. Review usage examples in `QuantumMonitoring.example.tsx`
3. Run tests to verify setup: `npm test -- QuantumMonitoring.test.tsx`
4. Check browser console for errors
5. Verify API endpoints are accessible

## Next Steps

Once the dashboard is running:
1. Verify all sections display data correctly
2. Test the refresh button
3. Test alert dismissal
4. Test export report
5. Check responsive design on mobile
6. Verify dark mode compatibility
7. Test with real quantum device data

Happy monitoring! 🚀
