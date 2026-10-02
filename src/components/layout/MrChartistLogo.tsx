import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  height?: number;
  iconOnly?: boolean;
}

/**
 * Official Mr. Chartist logo & four-band symbol from mrchartist.com.
 * Automatically adapts between light and dark modes.
 */
export default function MrChartistLogo({ className, height = 32, iconOnly = false }: Props) {
  const { theme } = useTheme();

  if (iconOnly) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex items-center justify-center shrink-0 rounded-[10px] overflow-hidden', className)}
        style={{ width: height, height: height }}
      >
        <img
          src="/favicon.svg"
          alt="Mr. Chartist Symbol"
          width={height}
          height={height}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      <img
        src="/branding/logo-horizontal-black.svg"
        alt="Mr. Chartist"
        height={height}
        className="w-auto shrink-0 object-contain block dark:hidden"
        style={{ height }}
      />
      <img
        src="/branding/logo-horizontal-white.svg"
        alt="Mr. Chartist"
        height={height}
        className="w-auto shrink-0 object-contain hidden dark:block"
        style={{ height }}
      />
    </div>
  );
}
