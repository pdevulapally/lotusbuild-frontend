export type Feature = {
  title: string;
  body: string;
};

// Full-width rows with a heavy rule above and between them, and an arrow button on the right.
export function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="w-full divide-y-2 divide-ink border-y-2 border-ink">
      {items.map(item => (
        <li key={item.title}>
          <div className="group flex items-center justify-between gap-6 py-7 text-left">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
                {item.title}
              </h3>
              <p className="max-w-2xl text-[16px] leading-7 text-muted">{item.body}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-transform duration-300 group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
