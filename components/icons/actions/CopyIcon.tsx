import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Copy Icon - Copy/duplicate action
 *
 * @usage
 * ```tsx
 * <CopyIcon className="h-5 w-5 text-gray-600" />
 * ```
 */
export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}
