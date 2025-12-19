import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Save Icon - Save/persist action
 *
 * @usage
 * ```tsx
 * <SaveIcon className="h-5 w-5 text-green-500" />
 * ```
 */
export function SaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconBase>
  );
}
