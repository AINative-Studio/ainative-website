# Code Quality Assessment Component

A professional code analysis tool powered by quantum neural networks for the AINative Studio platform.

## Quick Start

```tsx
import CodeQualityAssessment from '@/components/qnn/CodeQualityAssessment';

function MyPage() {
  return <CodeQualityAssessment />;
}
```

## Features

### Analysis Modes

#### 1. Code Snippet
- Paste code directly into the editor
- Select from 7 programming languages
- Load example code for testing
- See real-time line count

#### 2. File Upload
- Drag and drop support
- Auto language detection
- Preview uploaded content
- Supports common file extensions

### Quality Metrics

The tool analyzes:
- **Lines of Code**: Total executable lines
- **Comments**: Documentation coverage
- **Functions**: Code organization
- **Classes**: OOP structure
- **Complexity**: Function length and structure
- **Quality Score**: Overall assessment (0-100%)

### Visualizations

#### Quality Score Card
Color-coded percentage with:
- 🟢 Green (≥80%): High quality
- 🟡 Yellow (60-79%): Medium quality
- 🔴 Red (<60%): Needs improvement

#### Metrics Table
Comprehensive breakdown of all code statistics

#### Radar Chart
6-dimensional visualization:
- Code Size
- Comments
- Functions
- Classes
- Structure
- Quality

### Improvement Suggestions

Intelligent recommendations based on:
- Comment density
- Function length
- Code organization
- Best practices

## Supported Languages

| Language   | Extension | Features |
|------------|-----------|----------|
| Python     | .py       | Full support |
| JavaScript | .js       | Full support |
| TypeScript | .ts       | Full support |
| Java       | .java     | Full support |
| C++        | .cpp      | Full support |
| Go         | .go       | Full support |
| Rust       | .rs       | Full support |

## Example Usage

### Basic Integration

```tsx
import CodeQualityAssessment from '@/components/qnn/CodeQualityAssessment';

export default function QNNTools() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">QNN Code Analysis</h1>
      <CodeQualityAssessment />
    </div>
  );
}
```

### With Custom Wrapper

```tsx
import CodeQualityAssessment from '@/components/qnn/CodeQualityAssessment';
import { Card } from '@/components/ui/card';

export default function CustomAnalysis() {
  return (
    <Card className="p-6">
      <CodeQualityAssessment />
    </Card>
  );
}
```

## API Integration

### Current Implementation
Uses mock API for development. To connect to real QNN backend:

1. Update environment variables:
```bash
VITE_QNN_API_URL=https://api.yourqnn.com
VITE_QNN_API_TOKEN=your_token_here
```

2. The component will automatically use the API service.

### API Endpoint Format

```http
POST /api/v1/features/extract-from-code
Content-Type: application/json
Authorization: Bearer {token}

{
  "code": "def hello(): print('world')",
  "language": "python"
}
```

### Expected Response

```json
{
  "quality_score": 0.85,
  "features": {
    "file_size_bytes": 1234,
    "line_count": 45,
    "comment_count": 12,
    "function_count": 5,
    "class_count": 2,
    "avg_function_length": 9.0,
    "comment_ratio": 0.267
  },
  "normalized_features": [0.45, 0.267, 0.5, 0.4, 0.3, 0.85],
  "suggestions": [
    "Add more comments to improve code readability"
  ],
  "language": "python",
  "timestamp": "2025-10-29T12:34:56Z"
}
```

## Customization

### Adjust Quality Thresholds

Edit the helper functions in the component:

```typescript
const getQualityColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';  // High
  if (score >= 0.6) return 'text-yellow-600'; // Medium
  return 'text-red-600';                      // Low
};
```

### Add Custom Metrics

Extend the metrics table:

```typescript
<TableRow>
  <TableCell className="font-medium">Your Metric</TableCell>
  <TableCell className="text-right font-mono">
    {customMetricValue}
  </TableCell>
</TableRow>
```

### Modify Suggestions

Update the `generateSuggestions` function:

```typescript
if (yourCondition) {
  suggestions.push('Your custom suggestion');
}
```

## Props

The component is currently prop-less for simplicity. To add configuration:

```typescript
interface CodeQualityAssessmentProps {
  defaultLanguage?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  apiEndpoint?: string;
}
```

## Events

### Analysis Complete
Track when analysis finishes:

```typescript
const [result, setResult] = useState<AnalysisResult | null>(null);

// In handleAnalyze:
const result = await analyzeCode(code, language);
setAnalysisResult(result);
onAnalysisComplete?.(result); // Optional callback
```

## Styling

The component uses:
- **Tailwind CSS**: For utility classes
- **shadcn/ui**: For UI components
- **Framer Motion**: For animations
- **Recharts**: For visualizations

### Custom Themes

Modify colors via Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'your-color',
      }
    }
  }
}
```

## Performance

### Optimization Tips

1. **Code Caching**: Implement result caching
```typescript
const resultCache = new Map<string, AnalysisResult>();
```

2. **Debounced Analysis**: Add debouncing for large files
```typescript
import { useDebouncedCallback } from 'use-debounce';
```

3. **Lazy Loading**: Load chart library only when needed
```typescript
const RadarChart = lazy(() => import('recharts'));
```

## Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast colors
- ✅ Focus indicators

### Keyboard Shortcuts

- **Tab**: Navigate between inputs
- **Enter**: Submit for analysis (when focused on button)
- **Esc**: Close dialogs/modals

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Troubleshooting

### Issue: Analysis not working
**Solution**: Check API endpoint configuration and network tab

### Issue: File upload fails
**Solution**: Verify file type is supported and size is under 1MB

### Issue: Radar chart not showing
**Solution**: Ensure recharts is installed: `npm install recharts`

### Issue: Quality score seems wrong
**Solution**: Review quality calculation algorithm in service file

## File Structure

```
src/
├── components/qnn/
│   ├── CodeQualityAssessment.tsx      # Main component
│   ├── CodeQualityAssessment.md       # Full documentation
│   └── README_CODE_QUALITY.md         # This file
├── services/qnn/
│   └── code-analysis.ts               # API service
├── __tests__/components/qnn/
│   └── CodeQualityAssessment.test.tsx # Tests
└── pages/examples/
    └── CodeQualityPage.example.tsx    # Usage example
```

## Testing

Run the test suite:

```bash
npm test CodeQualityAssessment.test.tsx
```

Coverage includes:
- Component rendering
- User interactions
- File upload
- Analysis flow
- Error handling

## Contributing

To extend this component:

1. Add new language support in `LANGUAGES` array
2. Update pattern matching in `code-analysis.ts`
3. Add example code in `EXAMPLE_CODE`
4. Update tests
5. Update documentation

## Dependencies

Required:
- `react` ^18.3.1
- `framer-motion` ^11.0.0
- `recharts` ^2.x.x
- `lucide-react` ^0.446.0
- `@radix-ui/react-*` (various)

## License

Part of AINative Studio platform.

## Support

For issues or questions:
- GitHub Issues: https://github.com/AINative-Studio/core/issues
- Documentation: See CodeQualityAssessment.md

## Changelog

### v1.0.0 (2025-10-29)
- Initial release
- Two analysis modes (snippet/file)
- 7 language support
- Quality scoring with visualizations
- Improvement suggestions
- Export functionality
- Comprehensive testing
- Full documentation
