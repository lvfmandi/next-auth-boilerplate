import { cn } from '@/lib/utils';

export const FadeLoader = () => {
  const spans = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="w-16 h-16 relative inline-block">
      {spans.map((span) => {
        return (
          <span
            key={span}
            className={cn(
              'h-4 w-[2px] bg-primary block absolute rounded-full left-7 animate-pulse',
            )}
            style={{
              transform: `rotate(${(span / spans.length) * 360}deg)`,
              transformOrigin: '50% calc(50% + 20px)',
              animationDuration: '1200ms',
              transitionDelay: `${span * 100}ms`,
              animationDelay: `${span * 100}ms`,
            }}
          ></span>
        );
      })}
    </div>
  );
};
