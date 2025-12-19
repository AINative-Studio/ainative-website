import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Send Icon - Submit/send action
 *
 * @usage
 * ```tsx
 * <SendIcon className="h-5 w-5 text-blue-500" />
 * ```
 */
export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </IconBase>
  );
}
