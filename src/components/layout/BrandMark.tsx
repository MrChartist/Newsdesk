import { cn } from '@/lib/utils';

/** App-icon style squircle in Mr. Chartist ember. */
export default function BrandMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex items-center justify-center shadow-2', className)}
      style={{
        width: size, height: size, borderRadius: size * 0.27,
        background: 'linear-gradient(145deg, #F6935A 0%, #E5481E 100%)',
        boxShadow: 'inset 0 1px 0 #ffffff55, 0 4px 14px #E5481E40',
      }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62}>
        <path d="M14 44V20h6l16 15V20h6v24h-6L20 29v15z" fill="#fff" />
      </svg>
    </span>
  );
}
