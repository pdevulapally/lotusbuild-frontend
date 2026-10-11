export type Feature = {
  title: string;
  body: string;
};

// Cards floating over a photo backdrop, matching the demo window treatment.
export function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="grid w-full gap-5 sm:grid-cols-3">
      {items.map(item => (
        <li
          key={item.title}
          className="group flex flex-col gap-5 rounded-[20px] border border-line bg-paper p-7 text-left shadow-[0_24px_48px_-28px_rgba(38,38,38,0.35)] transition-transform duration-300 hover:-translate-y-1">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em]">{item.title}</h3>
            <p className="text-[15px] leading-7 text-muted">{item.body}</p>
          </div>
          <span
            aria-hidden="true"
            className="mt-auto ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 15L15 5M7 5h8v8" />
            </svg>
          </span>
        </li>
      ))}
    </ul>
  );
}
