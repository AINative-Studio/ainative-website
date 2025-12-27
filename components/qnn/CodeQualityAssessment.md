# Code Quality Assessment Component

A professional code quality analysis tool that uses quantum neural networks to analyze code and provide quality scores, metrics, and improvement suggestions.

## Features

### Two Analysis Modes

#### 1. Code Snippet Analysis
- **Language Selection**: Choose from Python, JavaScript, TypeScript, Java, C++, Go, or Rust
- **Code Editor**: Large textarea with monospace font for code input
- **Example Code**: Load pre-built examples for each language
- **Real-time Validation**: See line count and validation messages as you type

#### 2. File Upload Analysis
- **Drag & Drop Support**: Drag files directly into the dropzone
- **Auto Language Detection**: Automatically detects language from file extension
- **Code Preview**: Collapsible preview of uploaded file content
- **Multi-format Support**: Supports .py, .js, .ts, .java, .cpp, .go, .rs files

### Analysis Results

#### Quality Score
- **Visual Indicator**: Large percentage score with color coding
  - Green (80%+): High quality code
  - Yellow (60-79%): Medium quality code
  - Red (<60%): Needs improvement
- **Progress Bar**: Visual representation of the quality score
- **Status Icon**: CheckCircle for high quality, AlertCircle for lower quality

#### Code Metrics Table
Displays comprehensive code statistics:
- File Size (bytes)
- Lines of Code
- Comment Count
- Function Count
- Class Count
- Average Function Length
- Comment Ratio (percentage)

#### Feature Vector Visualization
- **Radar Chart**: 6-dimensional visualization of code characteristics
  - Code Size
  - Comments
  - Functions
  - Classes
  - Structure
  - Quality
- **Interactive Tooltips**: Hover to see exact values
- **Normalized Scale**: All metrics normalized to 0-100 scale

#### Improvement Suggestions
Intelligent recommendations based on code analysis:
- Comment density suggestions
- Function length recommendations
- Code organization tips
- Best practice reminders
- Numbered list with visual indicators

### Additional Features

#### Export Report
- **JSON Format**: Download analysis results as structured JSON
- **Timestamped**: Includes analysis timestamp
- **Complete Data**: All metrics, scores, and suggestions included

#### UI/UX Enhancements
- **Smooth Animations**: Framer Motion animations for state transitions
- **Loading States**: Clear loading indicators during analysis
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Support**: Adapts to system/app theme

## Usage

### Basic Implementation

```tsx
import CodeQualityAssessment from '@/components/qnn/CodeQualityAssessment';

function MyPage() {
  return (
    <div className="container mx-auto p-6">
      <CodeQualityAssessment />
    </div>
  );
}
```

### Integration with QNN API

The component includes a mock implementation for demonstration. To connect to the actual QNN API:

1. Replace the `analyzeCode` function with actual API call:

```typescript
const analyzeCode = async (code: string, language: string): Promise<AnalysisResult> => {
  const response = await fetch('/api/v1/features/extract-from-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      code,
      language,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze code');
  }

  return await response.json();
};
```

2. Update the `AnalysisResult` interface to match your API response:

```typescript
interface AnalysisResult {
  quality_score: number;
  features: CodeMetrics;
  normalized_features?: number[];
  suggestions?: string[];
  language: string;
  timestamp: string;
}
```

## API Integration

### Endpoint
```
POST /api/v1/features/extract-from-code
```

### Request Body
```json
{
  "code": "def hello():\n  print('world')",
  "language": "python"
}
```

### Expected Response
```json
{
  "quality_score": 0.75,
  "features": {
    "file_size_bytes": 1234,
    "line_count": 45,
    "comment_count": 12,
    "function_count": 5,
    "class_count": 2,
    "avg_function_length": 9.0,
    "comment_ratio": 0.267
  },
  "normalized_features": [0.45, 0.267, 0.5, 0.4, 0.3, 0.75],
  "suggestions": [
    "Add more comments to improve code readability",
    "Consider breaking down long functions into smaller ones"
  ],
  "language": "python",
  "timestamp": "2025-10-29T12:34:56Z"
}
```

## Component Architecture

### State Management
- `activeTab`: Current tab (snippet/file)
- `selectedLanguage`: Selected programming language
- `codeInput`: Code entered in textarea
- `uploadedFile`: Currently uploaded file
- `uploadedCode`: Content of uploaded file
- `detectedLanguage`: Auto-detected language from file
- `isAnalyzing`: Loading state
- `analysisResult`: Analysis results
- `error`: Error messages

### Key Functions

#### `analyzeCode(code, language)`
Analyzes code and returns quality metrics. Currently mocked; replace with actual API call.

#### `generateSuggestions(metrics, language)`
Generates improvement suggestions based on code metrics.

#### `handleFileUpload(event)`
Processes file upload, reads content, and detects language.

#### `exportReport()`
Exports analysis results as downloadable JSON file.

## Customization

### Styling
The component uses Tailwind CSS and shadcn/ui components. Customize by:

1. **Colors**: Modify quality thresholds and color classes
2. **Layout**: Adjust grid layouts and spacing
3. **Animations**: Configure Framer Motion variants
4. **Chart**: Customize Recharts appearance

### Quality Thresholds
Adjust quality score thresholds in the helper functions:

```typescript
const getQualityColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';  // High
  if (score >= 0.6) return 'text-yellow-600'; // Medium
  return 'text-red-600';                      // Low
};
```

### Metrics Displayed
Add or remove metrics in the results table:

```typescript
const metrics = [
  { label: 'File Size', value: `${features.file_size_bytes} bytes` },
  { label: 'Lines of Code', value: features.line_count },
  // Add custom metrics here
];
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **ARIA Labels**: Proper ARIA labels on all inputs and buttons
- **Screen Reader Support**: Meaningful text for screen readers
- **Color Contrast**: WCAG AA compliant color contrast ratios
- **Focus Indicators**: Clear focus states for all interactive elements

## Performance

- **Code Caching**: Results cached per code snippet (can be implemented)
- **Lazy Loading**: Charts only render when results are available
- **Debounced Input**: Can add debouncing for large files
- **File Size Limits**: Consider adding file size validation for performance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `framer-motion`: Animations
- `recharts`: Data visualization
- `lucide-react`: Icons
- `@radix-ui/react-*`: UI primitives
- `tailwindcss`: Styling

## Future Enhancements

### Planned Features
1. **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
2. **Multiple File Analysis**: Analyze entire projects
3. **Comparison Mode**: Compare code quality across versions
4. **Historical Tracking**: Track quality improvements over time
5. **Custom Rules**: Define custom quality rules and thresholds
6. **AI Suggestions**: More intelligent suggestions using LLM
7. **Code Formatting**: Integrate with formatters like Prettier
8. **Linting Integration**: Show ESLint/Pylint results

### API Enhancements
1. **Batch Analysis**: Analyze multiple files at once
2. **Async Processing**: Long-running analysis for large files
3. **Caching**: Server-side caching of analysis results
4. **Real-time Updates**: WebSocket support for live analysis

## Testing

The component includes comprehensive tests covering:
- Component rendering
- User interactions
- File upload functionality
- Analysis flow
- Error handling
- UI state management

Run tests with:
```bash
npm test CodeQualityAssessment.test.tsx
```

## Troubleshooting

### Common Issues

**Issue**: Analysis takes too long
- **Solution**: Check API endpoint performance, consider adding timeout

**Issue**: File upload not working
- **Solution**: Verify file type is in accepted list, check file size

**Issue**: Radar chart not displaying
- **Solution**: Ensure recharts is installed, check normalized_features data

**Issue**: Quality score always low
- **Solution**: Review quality calculation algorithm, adjust thresholds

## License

Part of the AINative Studio QNN platform.
