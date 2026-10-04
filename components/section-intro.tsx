type SectionIntroProps = {
  titleId: string;
  eyebrow?: string;
  title: string;
  body?: string;
};

// Dashed pill with a bar meter, matching the section label design.
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-dashed border-line px-5 py-2 text-[13px] uppercase tracking-wide text-ink">
      <span aria-hidden="true" className="flex items-center gap-1">
        <span className="h-3 w-0.5 rounded-full bg-[#5178ef]" />
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="h-3 w-0.5 rounded-full bg-line" />
        ))}
      </span>
      {children}
    </div>
  );
}

export function SectionIntro({ titleId, eyebrow, title, body }: SectionIntroProps) {
  return (
    <div className="flex max-w-3xl flex-col items-center gap-5 text-center">
      {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
      <h2
        id={titleId}
        className="text-balance font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-7xl"
      >
        {title}
      </h2>
      {body && <p className="max-w-2xl text-balance text-lg leading-8 text-muted">{body}</p>}
    </div>
  );
}
