import { cn } from '@/lib/utils';

/** App-icon style squircle with the official Mr. Chartist mark. */
export default function BrandMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex items-center justify-center shrink-0 overflow-hidden', className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        background: 'linear-gradient(145deg, #242426 0%, #0d0d0d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.25)',
      }}
    >
      <img
        src="/favicon.svg"
        alt="Mr. Chartist"
        width={size * 0.74}
        height={size * 0.74}
        className="w-[74%] h-[74%] object-contain brightness-0 invert"
      />
    </span>
  );
}
