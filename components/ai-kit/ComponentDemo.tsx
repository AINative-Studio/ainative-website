'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface CodeExampleProps {
  code: string;
  componentName: string;
}

function CodeExample({ code, componentName }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative" role="region" aria-label={`Code example for ${componentName}`}>
      <pre className="bg-vite-bg rounded-lg p-4 overflow-x-auto border border-[#2D333B] text-xs">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={copyCode}
        className="absolute right-2 top-2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
        aria-label={`Copy code for ${componentName}`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-500" />
            <span className="sr-only">Copied</span>
          </>
        ) : (
          <Copy className="h-3 w-3 text-gray-400" />
        )}
      </button>
      {copied && (
        <span className="absolute right-12 top-3 text-xs text-green-400">Copied!</span>
      )}
    </div>
  );
}

export function ButtonDemo() {
  const code = `import { AIKitButton } from '@ainative/ai-kit-design-system';

function MyComponent() {
  return (
    <div className="flex gap-4">
      <AIKitButton variant="primary">
        Primary Button
      </AIKitButton>
      <AIKitButton variant="secondary">
        Secondary Button
      </AIKitButton>
      <AIKitButton variant="outline">
        Outline Button
      </AIKitButton>
      <AIKitButton disabled>
        Disabled Button
      </AIKitButton>
    </div>
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B]">
        <div className="flex flex-wrap gap-3">
          <Button className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
            Primary Button
          </Button>
          <Button variant="secondary">
            Secondary Button
          </Button>
          <Button variant="outline" className="border-[#4B6FED]">
            Outline Button
          </Button>
          <Button variant="ghost">
            Ghost Button
          </Button>
          <Button disabled>
            Disabled Button
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500">Default State</p>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitButton" />
    </div>
  );
}

export function TextFieldDemo() {
  const [value, setValue] = useState('');

  const code = `import { AIKitTextField } from '@ainative/ai-kit-design-system';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <AIKitTextField
      placeholder="Enter text here..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLength={100}
      showCount
    />
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B] space-y-4">
        <div>
          <Label htmlFor="text-demo" className="text-white mb-2 block">
            Standard Input
          </Label>
          <Input
            id="text-demo"
            placeholder="Enter text here..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-[#161B22] border-[#2D333B] text-white"
          />
          <p className="mt-2 text-xs text-gray-500">
            {value.length} / 100 characters
          </p>
        </div>

        <div>
          <Label htmlFor="email-demo" className="text-white mb-2 block">
            Email Input
          </Label>
          <Input
            id="email-demo"
            type="email"
            placeholder="your@email.com"
            className="bg-[#161B22] border-[#2D333B] text-white"
          />
        </div>

        <div>
          <Label htmlFor="password-demo" className="text-white mb-2 block">
            Password Input
          </Label>
          <Input
            id="password-demo"
            type="password"
            placeholder="Enter password"
            className="bg-[#161B22] border-[#2D333B] text-white"
          />
        </div>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitTextField" />
    </div>
  );
}

export function SliderDemo() {
  const [value, setValue] = useState([50]);

  const code = `import { AIKitSlider } from '@ainative/ai-kit-design-system';

function MyComponent() {
  const [value, setValue] = useState([50]);

  return (
    <AIKitSlider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      step={1}
    />
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B] space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-white">Volume</Label>
            <span className="text-sm text-gray-400">{value[0]}%</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Min: 0</span>
            <span>Value: {value[0]}</span>
            <span>Max: 100</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-white">Temperature (0.0 - 2.0)</Label>
            <span className="text-sm text-gray-400">{(value[0] / 50).toFixed(2)}</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitSlider" />
    </div>
  );
}

export function CheckBoxDemo() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);

  const code = `import { AIKitCheckBox } from '@ainative/ai-kit-design-system';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <AIKitCheckBox
        id="terms"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <label htmlFor="terms">
        Accept terms and conditions
      </label>
    </div>
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B] space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="check1"
            checked={checked1}
            onCheckedChange={(checked) => setChecked1(checked as boolean)}
          />
          <Label htmlFor="check1" className="text-white cursor-pointer">
            Accept terms and conditions
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="check2"
            checked={checked2}
            onCheckedChange={(checked) => setChecked2(checked as boolean)}
          />
          <Label htmlFor="check2" className="text-white cursor-pointer">
            Subscribe to newsletter
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="check3"
            checked={checked3}
            onCheckedChange={(checked) => setChecked3(checked as boolean)}
          />
          <Label htmlFor="check3" className="text-white cursor-pointer">
            Enable notifications
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="check4" disabled />
          <Label htmlFor="check4" className="text-gray-500 cursor-not-allowed">
            Disabled checkbox
          </Label>
        </div>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitCheckBox" />
    </div>
  );
}

export function ChoicePickerDemo() {
  const [value, setValue] = useState('option1');

  const code = `import { AIKitChoicePicker } from '@ainative/ai-kit-design-system';

function MyComponent() {
  const [value, setValue] = useState('option1');

  return (
    <AIKitChoicePicker
      value={value}
      onValueChange={setValue}
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]}
    />
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B]">
        <Label className="text-white mb-4 block">Select an option</Label>
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center gap-2 mb-3">
            <RadioGroupItem value="option1" id="option1" />
            <Label htmlFor="option1" className="text-white cursor-pointer">
              GPT-4 (Most Capable)
            </Label>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <RadioGroupItem value="option2" id="option2" />
            <Label htmlFor="option2" className="text-white cursor-pointer">
              GPT-3.5 (Faster)
            </Label>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <RadioGroupItem value="option3" id="option3" />
            <Label htmlFor="option3" className="text-white cursor-pointer">
              Claude (Balanced)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option4" id="option4" />
            <Label htmlFor="option4" className="text-white cursor-pointer">
              Llama (Open Source)
            </Label>
          </div>
        </RadioGroup>
        <p className="mt-4 text-xs text-gray-500">Selected: {value}</p>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitChoicePicker" />
    </div>
  );
}

export function DividerDemo() {
  const code = `import { AIKitDivider } from '@ainative/ai-kit-design-system';

function MyComponent() {
  return (
    <div>
      {/* Horizontal Divider */}
      <AIKitDivider orientation="horizontal" />

      {/* Vertical Divider */}
      <div className="flex h-20">
        <div>Left Content</div>
        <AIKitDivider orientation="vertical" />
        <div>Right Content</div>
      </div>
    </div>
  );
}`;

  return (
    <div className="space-y-4">
      {/* Demo */}
      <div className="p-6 bg-[#0D1117] rounded-lg border border-[#2D333B] space-y-6">
        <div>
          <p className="text-white mb-2 text-sm">Horizontal Divider</p>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Content above</p>
            <Separator className="bg-[#2D333B]" />
            <p className="text-gray-400 text-sm">Content below</p>
          </div>
        </div>

        <div>
          <p className="text-white mb-2 text-sm">Vertical Divider</p>
          <div className="flex items-center h-20 gap-4">
            <div className="flex-1 text-gray-400 text-sm">Left Content</div>
            <Separator orientation="vertical" className="bg-[#2D333B] h-full" />
            <div className="flex-1 text-gray-400 text-sm">Right Content</div>
          </div>
        </div>

        <div>
          <p className="text-white mb-2 text-sm">With Custom Color</p>
          <Separator className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]" />
        </div>
      </div>

      {/* Code */}
      <CodeExample code={code} componentName="AIKitDivider" />
    </div>
  );
}
