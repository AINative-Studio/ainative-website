import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Code Icon - Code/development feature
 *
 * @usage
 * ```tsx
 * <CodeIcon className="h-6 w-6 text-blue-500" />
 * ```
 */
export function CodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconBase>
  );
}
