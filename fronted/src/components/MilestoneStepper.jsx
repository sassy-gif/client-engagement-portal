export default function MilestoneStepper({ milestones }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="flex w-full overflow-x-auto py-2">
      {milestones.map((m, idx) => {
        const isCompleted = m.status === 'completed';
        const isInProgress = m.status === 'in_progress';

        return (
          <div key={m.id} className="flex items-center flex-shrink-0">
            <div
              className={[
                'relative flex flex-col justify-center min-w-[150px] h-16 px-5',
                'transition-colors duration-200',
                isCompleted ? 'bg-sage text-paper' : isInProgress ? 'bg-brass text-paper' : 'bg-white text-ink/60 border border-hairline'
              ].join(' ')}
              style={{
                clipPath: idx === 0
                  ? 'polygon(0 0, 100% 0, 88% 100%, 0 100%)'
                  : 'polygon(12% 0, 100% 0, 88% 100%, 0 100%)',
                marginLeft: idx === 0 ? 0 : '-12px'
              }}
            >
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                Stage {idx + 1}
              </span>
              <span className="font-display text-sm leading-tight truncate">
                {m.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}