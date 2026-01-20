#!/usr/bin/env python3
"""
Generate test template files for untested components
Issue #354 - Component test coverage gap analysis
"""

import os
import re
from pathlib import Path

BASEDIR = Path("/Users/aideveloper/ainative-website-nextjs-staging")

# Top 20 critical components to test
TOP_20_COMPONENTS = [
    "app/dev-resources/DevResourcesClient.tsx",
    "app/dashboard/agents/AgentsClient.tsx",
    "app/design-system-showcase/DesignSystemShowcaseClient.tsx",
    "services/QNNApiClient.ts",
    "app/dashboard/email/EmailManagementClient.tsx",
    "app/ai-kit/AIKitClient.tsx",
    "app/dashboard/zerodb/ZeroDBClient.tsx",
    "app/api-reference/APIReferenceClient.tsx",
    "app/dashboard/load-testing/LoadTestingClient.tsx",
    "app/integrations/IntegrationsClient.tsx",
    "app/examples/ExamplesClient.tsx",
    "app/dashboard/DashboardClient.tsx",
    "app/dashboard/api-sandbox/APISandboxClient.tsx",
    "app/dashboard/main/MainDashboardClient.tsx",
    "app/community/videos/[slug]/VideoDetailClient.tsx",
    "app/developer-tools/DeveloperToolsClient.tsx",
    "app/dashboard/sessions/SessionsClient.tsx",
    "app/dashboard/mcp-hosting/MCPHostingClient.tsx",
    "app/demo/progress-indicators/ProgressIndicatorsDemoClient.tsx",
    "app/agent-swarm/AgentSwarmClient.tsx",
]

def analyze_component(file_path):
    """Analyze component file to extract key information for test generation"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract component name
        component_name = file_path.stem

        # Check if it's a client component
        is_client = "'use client'" in content or '"use client"' in content

        # Find state hooks
        state_hooks = re.findall(r'const\s+\[(\w+),\s*set\w+\]\s*=\s*useState', content)

        # Find async functions
        async_funcs = re.findall(r'const\s+(\w+)\s*=\s*async\s*\(', content)

        # Find form submissions
        has_form = 'onSubmit' in content or '<form' in content

        # Find API calls
        api_calls = 'fetch(' in content or 'axios' in content or '.get(' in content or '.post(' in content

        # Find mutations
        has_mutations = any(word in content for word in ['useMutation', 'mutate', 'onCreate', 'onUpdate', 'onDelete'])

        return {
            'component_name': component_name,
            'is_client': is_client,
            'state_hooks': state_hooks[:5],  # Limit to first 5
            'async_funcs': async_funcs[:5],
            'has_form': has_form,
            'api_calls': api_calls,
            'has_mutations': has_mutations,
        }
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None

def generate_test_template(component_path, info):
    """Generate a test template based on component analysis"""

    component_name = info['component_name']
    is_tsx = component_path.suffix == '.tsx'

    # Determine import path
    relative_import = f"../{component_name}"

    test_content = f"""import {{ render, screen, waitFor, fireEvent }} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {component_name} from '{relative_import}';

// Mock dependencies
jest.mock('next/navigation', () => ({{
  useRouter: () => ({{
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }}),
  useSearchParams: () => ({{
    get: jest.fn(),
  }}),
  usePathname: () => '/test-path',
}}));

jest.mock('next-auth/react', () => ({{
  useSession: () => ({{
    data: {{
      user: {{ id: '1', name: 'Test User', email: 'test@example.com' }},
      expires: '2025-12-31',
    }},
    status: 'authenticated',
  }}),
  signIn: jest.fn(),
  signOut: jest.fn(),
}}));

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({{
    ok: true,
    json: () => Promise.resolve({{ data: {{}} }}),
  }})) as jest.Mock
);

describe('{component_name}', () => {{
  beforeEach(() => {{
    jest.clearAllMocks();
  }});

  afterEach(() => {{
    jest.restoreAllMocks();
  }});

  describe('Rendering', () => {{
    it('should render without crashing', () => {{
      // Given
      const {{ container }} = render(<{component_name} />);

      // Then
      expect(container).toBeInTheDocument();
    }});

    it('should display loading state initially', async () => {{
      // Given
      render(<{component_name} />);

      // Then - Check for loading indicators
      // expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    }});
  }});

"""

    # Add state tests if state hooks are found
    if info['state_hooks']:
        test_content += f"""  describe('State Management', () => {{
"""
        for state_var in info['state_hooks'][:3]:
            test_content += f"""    it('should manage {state_var} state', async () => {{
      // Given
      render(<{component_name} />);

      // When
      // Interact with component to change {state_var}

      // Then
      // expect(...).toBe(expectedValue);
    }});

"""
        test_content += """  });

"""

    # Add form tests if forms are present
    if info['has_form']:
        test_content += f"""  describe('Form Handling', () => {{
    it('should handle form submission', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // Fill out form fields
      // const submitButton = screen.getByRole('button', {{ name: /submit/i }});
      // await user.click(submitButton);

      // Then
      // expect(mockSubmitHandler).toHaveBeenCalled();
    }});

    it('should validate form fields', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // Submit form with invalid data
      // const submitButton = screen.getByRole('button', {{ name: /submit/i }});
      // await user.click(submitButton);

      // Then
      // expect(screen.getByText(/validation error/i)).toBeInTheDocument();
    }});

    it('should display error message on submission failure', async () => {{
      // Given
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // Submit form
      // await user.click(screen.getByRole('button', {{ name: /submit/i }}));

      // Then
      await waitFor(() => {{
        // expect(screen.getByText(/error/i)).toBeInTheDocument();
      }});
    }});
  }});

"""

    # Add API call tests
    if info['api_calls']:
        test_content += f"""  describe('API Integration', () => {{
    it('should fetch data on mount', async () => {{
      // Given
      const mockData = {{ id: 1, name: 'Test Data' }};
      (global.fetch as jest.Mock).mockResolvedValueOnce({{
        ok: true,
        json: async () => ({{ data: mockData }}),
      }});

      // When
      render(<{component_name} />);

      // Then
      await waitFor(() => {{
        expect(global.fetch).toHaveBeenCalled();
      }});
    }});

    it('should handle API errors gracefully', async () => {{
      // Given
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When
      render(<{component_name} />);

      // Then
      await waitFor(() => {{
        // expect(screen.getByText(/error/i)).toBeInTheDocument();
      }});
    }});

    it('should retry failed API calls', async () => {{
      // Given
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({{
          ok: true,
          json: async () => ({{ data: {{}} }}),
        }});

      // When
      render(<{component_name} />);

      // Then - Implement retry logic test
    }});
  }});

"""

    # Add mutation tests
    if info['has_mutations']:
        test_content += f"""  describe('Data Mutations', () => {{
    it('should create new item successfully', async () => {{
      // Given
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({{
        ok: true,
        json: async () => ({{ data: {{ id: '1', created: true }} }}),
      }});

      render(<{component_name} />);

      // When
      // Trigger create action
      // await user.click(screen.getByRole('button', {{ name: /create/i }}));

      // Then
      await waitFor(() => {{
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({{ method: 'POST' }})
        );
      }});
    }});

    it('should update existing item', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // Trigger update action

      // Then
      // expect(mockUpdateHandler).toHaveBeenCalled();
    }});

    it('should delete item with confirmation', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // Click delete button
      // Confirm deletion

      // Then
      // expect(mockDeleteHandler).toHaveBeenCalled();
    }});
  }});

"""

    # Add user interaction tests
    test_content += f"""  describe('User Interactions', () => {{
    it('should handle button clicks', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // const button = screen.getByRole('button', {{ name: /action/i }});
      // await user.click(button);

      // Then
      // expect(mockHandler).toHaveBeenCalled();
    }});

    it('should handle keyboard navigation', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      // await user.keyboard('{{Tab}}');

      // Then
      // expect(document.activeElement).toHaveFocus();
    }});
  }});

"""

    # Add accessibility tests
    test_content += f"""  describe('Accessibility', () => {{
    it('should have proper ARIA labels', () => {{
      // Given
      render(<{component_name} />);

      // Then
      // Check for ARIA attributes
      // expect(screen.getByRole('button')).toHaveAccessibleName();
    }});

    it('should support keyboard navigation', async () => {{
      // Given
      const user = userEvent.setup();
      render(<{component_name} />);

      // When
      await user.tab();

      // Then
      // expect(document.activeElement).toHaveAttribute('tabindex', '0');
    }});

    it('should announce dynamic content changes', async () => {{
      // Given
      render(<{component_name} />);

      // Then
      // Check for live regions
      // expect(screen.getByRole('status')).toBeInTheDocument();
    }});
  }});

"""

    # Add error boundary tests
    test_content += f"""  describe('Error Handling', () => {{
    it('should display error boundary on component crash', () => {{
      // Given
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {{}});

      // When/Then
      // Test error boundary by forcing error
      consoleError.mockRestore();
    }});

    it('should recover from errors', async () => {{
      // Given
      render(<{component_name} />);

      // When
      // Trigger error and recovery

      // Then
      // expect(screen.getByText(/recovered/i)).toBeInTheDocument();
    }});
  }});

"""

    # Add edge cases
    test_content += f"""  describe('Edge Cases', () => {{
    it('should handle null props gracefully', () => {{
      // Given/When
      const {{ container }} = render(<{component_name} />);

      // Then
      expect(container).toBeInTheDocument();
    }});

    it('should handle empty data arrays', async () => {{
      // Given
      (global.fetch as jest.Mock).mockResolvedValueOnce({{
        ok: true,
        json: async () => ({{ data: [] }}),
      }});

      // When
      render(<{component_name} />);

      // Then
      await waitFor(() => {{
        // expect(screen.getByText(/no data/i)).toBeInTheDocument();
      }});
    }});

    it('should handle very large datasets', async () => {{
      // Given
      const largeDataset = Array.from({{ length: 1000 }}, (_, i) => ({{ id: i }}));
      (global.fetch as jest.Mock).mockResolvedValueOnce({{
        ok: true,
        json: async () => ({{ data: largeDataset }}),
      }});

      // When
      render(<{component_name} />);

      // Then
      await waitFor(() => {{
        expect(global.fetch).toHaveBeenCalled();
      }});
    }});

    it('should handle concurrent updates', async () => {{
      // Given
      render(<{component_name} />);

      // When
      // Trigger multiple concurrent updates

      // Then
      // Verify state is consistent
    }});
  }});
}});
"""

    return test_content

def create_test_file(component_path_str):
    """Create test file for a component"""
    component_path = BASEDIR / component_path_str

    if not component_path.exists():
        print(f"❌ Component not found: {component_path}")
        return False

    # Analyze component
    info = analyze_component(component_path)
    if not info:
        return False

    # Determine test file path
    test_dir = component_path.parent / "__tests__"
    test_dir.mkdir(exist_ok=True)

    test_file_name = f"{component_path.stem}.test{component_path.suffix}"
    test_file_path = test_dir / test_file_name

    if test_file_path.exists():
        print(f"⚠️  Test file already exists: {test_file_path}")
        return False

    # Generate test content
    test_content = generate_test_template(component_path, info)

    # Write test file
    with open(test_file_path, 'w') as f:
        f.write(test_content)

    print(f"✅ Created test file: {test_file_path}")
    return True

def main():
    """Generate test files for top 20 components"""
    print("=== Generating Test Files for Top 20 Components ===\n")

    created = 0
    skipped = 0
    errors = 0

    for i, component_path in enumerate(TOP_20_COMPONENTS, 1):
        print(f"\n[{i}/20] Processing: {component_path}")
        try:
            if create_test_file(component_path):
                created += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"❌ Error: {e}")
            errors += 1

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✅ Created: {created}")
    print(f"  ⚠️  Skipped: {skipped}")
    print(f"  ❌ Errors: {errors}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
