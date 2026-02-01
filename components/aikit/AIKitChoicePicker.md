# AIKitChoicePicker Component

A fully accessible, chip-based multi-choice selection component for the AI Native Studio design system.

## Features

- **Single & Multi-Select Modes**: Toggle between single or multiple selection
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Home, End, Enter, Space, Tab)
- **Accessibility Compliant**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Disabled States**: Support for disabling all options or specific options
- **Selection Limits**: Optional maximum selection limit for multi-select mode
- **Clear All**: Optional clear all button to reset selections
- **Dark Theme**: Optimized for dark backgrounds with AI Kit branding
- **Responsive**: Automatically wraps to fit container width
- **Performance Optimized**: Uses React.memo and useMemo for efficient rendering

## Installation

```tsx
import { AIKitChoicePicker } from '@/components/aikit';
```

## Basic Usage

### Multi-Select Mode (Default)

```tsx
<AIKitChoicePicker
  label="Choose your frameworks"
  options={[
    { id: '1', label: 'React', value: 'react' },
    { id: '2', label: 'Vue', value: 'vue' },
    { id: '3', label: 'Angular', value: 'angular' },
  ]}
  onChange={(values) => console.log(values)}
  mode="multi"
/>
```

### Single-Select Mode

```tsx
<AIKitChoicePicker
  label="Choose your primary framework"
  options={frameworks}
  onChange={(values) => console.log(values)}
  mode="single"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label for the choice picker group |
| `options` | `ChoiceOption[]` | **required** | Array of available options |
| `onChange` | `(values: string[]) => void` | `undefined` | Callback when selection changes |
| `value` | `string[]` | `undefined` | Current selected values (controlled) |
| `defaultValue` | `string[]` | `[]` | Default selected values (uncontrolled) |
| `mode` | `'single' \| 'multi'` | `'multi'` | Selection mode |
| `disabled` | `boolean` | `false` | Disable all options |
| `showClearAll` | `boolean` | `false` | Show clear all button |
| `maxSelections` | `number` | `undefined` | Maximum selections (multi mode only) |
| `className` | `string` | `undefined` | Additional CSS classes |
| `aria-label` | `string` | `undefined` | ARIA label for the group |

### ChoiceOption Type

```tsx
interface ChoiceOption {
  id: string;        // Unique identifier
  label: string;     // Display label
  value: string;     // Value for selection
  disabled?: boolean; // Whether this option is disabled
}
```

## Examples

### With Clear All Button

```tsx
<AIKitChoicePicker
  label="Choose categories"
  options={categories}
  onChange={handleChange}
  mode="multi"
  showClearAll
/>
```

### With Maximum Selection Limit

```tsx
<AIKitChoicePicker
  label="Choose up to 3 options"
  options={options}
  onChange={handleChange}
  mode="multi"
  maxSelections={3}
  showClearAll
/>
```

### Partially Disabled Options

```tsx
<AIKitChoicePicker
  label="Choose available frameworks"
  options={[
    { id: '1', label: 'React', value: 'react' },
    { id: '2', label: 'Vue (Coming Soon)', value: 'vue', disabled: true },
    { id: '3', label: 'Angular', value: 'angular' },
  ]}
  onChange={handleChange}
/>
```

### Controlled Component

```tsx
const [selected, setSelected] = useState<string[]>(['react']);

<AIKitChoicePicker
  label="Choose frameworks"
  options={frameworks}
  value={selected}
  onChange={setSelected}
  mode="multi"
/>
```

### Form Integration

```tsx
const [formData, setFormData] = useState({
  frameworks: ['react'],
  categories: ['tech'],
});

<form>
  <AIKitChoicePicker
    label="Which frameworks do you use?"
    options={frameworkOptions}
    value={formData.frameworks}
    onChange={(values) => setFormData({ ...formData, frameworks: values })}
    mode="multi"
    showClearAll
  />

  <AIKitChoicePicker
    label="Primary category"
    options={categoryOptions}
    value={formData.categories}
    onChange={(values) => setFormData({ ...formData, categories: values })}
    mode="single"
  />
</form>
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next option |
| `Shift + Tab` | Move to previous option |
| `Arrow Right` | Navigate to next option |
| `Arrow Left` | Navigate to previous option |
| `Arrow Down` | Navigate to next option |
| `Arrow Up` | Navigate to previous option |
| `Home` | Jump to first option |
| `End` | Jump to last option |
| `Enter` | Toggle selection |
| `Space` | Toggle selection |

## Accessibility Features

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Semantic HTML**: Uses proper button elements and ARIA attributes
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels, roles, and states
- **Focus Indicators**: Visible focus rings with AI Kit theming (#4B6FED)
- **Color Contrast**: High contrast colors that meet WCAG AA requirements
- **Disabled States**: Properly announced to assistive technologies

### ARIA Attributes

- `role="group"` on the options container
- `aria-labelledby` or `aria-label` for group labeling
- `aria-pressed` for selection state on each option
- `aria-disabled` for disabled options

## Styling

The component uses AI Kit brand colors and supports dark themes:

- **Primary Color**: `#4B6FED` (AI Kit blue)
- **Gradient**: `#4B6FED` → `#8A63F4`
- **Focus Ring**: `#4B6FED` with proper offset
- **Selected State**: Gradient background with shadow
- **Unselected State**: Dark gray (`#1F2937`) with hover effects
- **Disabled State**: Reduced opacity with gray colors

## Performance

The component is optimized for performance:

- **React.memo**: Prevents unnecessary re-renders
- **useMemo**: Memoizes selected values set for O(1) lookup
- **useCallback**: Memoizes event handlers
- **Custom Equality Check**: Efficient props comparison

## Testing

The component has 94.66% code coverage with comprehensive tests covering:

- ✅ Rendering in all configurations
- ✅ Single and multi-select modes
- ✅ Disabled states (global and per-option)
- ✅ Clear all functionality
- ✅ Keyboard navigation
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Controlled and uncontrolled modes
- ✅ Error handling
- ✅ Visual styling

Run tests:

```bash
npm test -- AIKitChoicePicker
```

## Storybook

View all component states and variations in Storybook:

```bash
npm run storybook
```

Available stories:
- Default
- Single Select
- Multi Select
- With Clear All
- Max Selections Limit
- Disabled
- Partially Disabled
- Without Label
- Large Option Set
- Interactive Controlled
- Form Example
- Accessibility Demo
- All States
- Responsive Layout

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (latest)

## Contributing

When modifying this component:

1. Follow TDD principles (RED-GREEN-REFACTOR)
2. Maintain 85%+ test coverage
3. Ensure WCAG 2.1 AA compliance
4. Update Storybook stories
5. Run linting and type checking
6. Test keyboard navigation
7. Test with screen readers

## Related Components

- `AIKitButton` - Button component with AI Kit styling
- `AIKitCheckBox` - Checkbox component for form inputs
- `AIKitTabs` - Tab navigation component

## License

Part of the AI Native Studio component library.
