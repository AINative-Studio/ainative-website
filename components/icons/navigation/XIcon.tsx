import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * X Icon - Close/dismiss icon
 *
 * @usage
 * ```tsx
 * <XIcon className="h-6 w-6 text-gray-700" />
 * ```
 */
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}
