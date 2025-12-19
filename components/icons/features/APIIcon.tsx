import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * API Icon - API/integration feature
 *
 * @usage
 * ```tsx
 * <APIIcon className="h-6 w-6 text-green-500" />
 * ```
 */
export function APIIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
    </IconBase>
  );
}
