'use client';

import {useEffect, useId, useRef, useState, useSyncExternalStore} from 'react';
import {
  ChatComposer,
  ChatComposerInput,
  ChatDictationButton,
  useChatDictation,
  type ChatComposerInputHandle,
} from '@astryxdesign/core/Chat';
import type {CSSProperties} from 'react';
import {IconArrowUp, IconLoader2, IconPlayerStop} from '@tabler/icons-react';
import type {AiEffort, SessionMode} from '@/lib/api/sessions';
import type {AgentModel} from '@/lib/api/me';

export type AiInputOptions = {effort?: AiEffort; mode: SessionMode};

type PickerOption = {value: string; label: string; description: string};

function ComposerSelect({label, value, options, onChange}: {
  label: string; value: string; options: PickerOption[]; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
  }, [open]);
  const close = () => {setOpen(false); trigger.current?.focus();};
  return <div className="relative min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape') {event.preventDefault(); close();}
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (!open) {setOpen(true); return;}
    const buttons = [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
      (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }}>
    <button ref={trigger} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => setOpen(current => !current)}
      className={`flex max-w-52 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/40 ${open ? 'bg-ink/5 text-ink' : 'text-ink/65 hover:bg-ink/5 hover:text-ink'}`}>
      <span className="truncate">{options.find(option => option.value === value)?.label ?? value}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
        className={`shrink-0 text-ink/40 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}><path d="M2.25 3.75 5 6.5l2.75-2.75" /></svg>
    </button>
    {open && <div id={id} ref={menu} role="menu" aria-label={label}
      className="absolute bottom-full left-0 z-40 mb-2 max-h-80 w-72 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-2xl border border-line/80 bg-paper p-1.5 shadow-[0_12px_40px_-12px_rgba(38,38,38,0.25)]">
      <p className="px-3 pb-2 pt-2 text-[11px] font-medium text-muted">{label}</p>
      {options.map(option => <button key={option.value} type="button" role="menuitemradio" aria-checked={option.value === value}
        onClick={() => {onChange(option.value); close();}}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-ink/75 transition-colors hover:bg-line/35 focus:bg-line/45 focus:outline-none aria-checked:bg-line/45 aria-checked:text-ink">
        <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium">{option.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-muted">{option.description}</span></span>
        {option.value === value && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m2.5 7.5 3 3 6-6.5" /></svg>}
      </button>)}
    </div>}
  </div>;
}

function modelLabel(model: string): string {
  return model
    .split(/[-_.]+/)
    .map(part => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ')
    .replace(/(\d) (\d)/g, '$1.$2');
}


const composerTheme = {
  '--color-background-popover': '#f7f5f3',
  '--color-background-surface': '#f7f5f3',
  '--color-background-card': '#f7f5f3',
  '--color-background-muted': '#efebe7',
  '--color-border': '#d6d0ca',
  '--color-border-emphasized': '#d6d0ca',
  '--color-text-primary': '#262626',
  '--color-text-secondary': '#5c5854',
  '--color-accent': '#262626',
  '--_chat-composer-radius': '24px',
} as CSSProperties;

const glassTheme = {
  ...composerTheme,
  '--color-background-popover': 'rgba(247, 245, 243, 0.86)',
  '--color-background-surface': 'rgba(247, 245, 243, 0.86)',
  '--color-background-card': 'rgba(247, 245, 243, 0.86)',
  '--color-background-muted': 'rgba(239, 235, 231, 0.78)',
  '--color-border': 'rgba(255, 255, 255, 0.76)',
  '--color-border-emphasized': 'rgba(255, 255, 255, 0.82)',
} as CSSProperties;

type AiInputProps = {
  label: string;
  placeholder?: string;
  onSubmit?: (value: string, model: string, options: AiInputOptions) => boolean | void | Promise<boolean | void>;
  models?: string[];
  modelOptions?: AgentModel[];
  sessionModel?: string;
  effort?: string;
  effortOptions?: AiEffort[];
  sessionMode?: SessionMode;
  sessionControls?: boolean;
  compact?: boolean;
  allowUnconfiguredSubmit?: boolean;
  isDisabled?: boolean;
  isWorking?: boolean;
  isStopping?: boolean;
  onStop?: () => void;
  announcement?: string | null;
  error?: string | null;
  queuedCount?: number;
  /** "glass" is for placing the composer directly over a photo (e.g. a
   * workspace home screen's background); everywhere else stays opaque. */
  variant?: 'default' | 'glass';
  className?: string;
};

// Composer with a text input and voice input.
// Mode, reference, attachments, and settings controls are intentionally not included.
export function AiInput({
  label,
  placeholder = 'Ask anything',
  onSubmit,
  isDisabled = false,
  isWorking = false,
  isStopping = false,
  onStop,
  announcement,
  error,
  queuedCount = 0,
  models = [],
  modelOptions,
  sessionModel,
  effort,
  effortOptions = [],
  sessionMode,
  sessionControls = false,
  compact = false,
  allowUnconfiguredSubmit = false,
  variant = 'default',
  className = '',
}: AiInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<ChatComposerInputHandle>(null);
  const dictation = useChatDictation({inputRef});
  const [chosenModel, setModel] = useState('');
  const [chosenEffort, setEffort] = useState<AiEffort | undefined>(effortOptions.at(-1));
  const [chosenMode, setMode] = useState<SessionMode>('build');
  const model = sessionModel ?? (models.includes(chosenModel) ? chosenModel : models[0] ?? '');
  const availableEfforts = modelOptions ? modelOptions.find(option => option.id === model)?.efforts ?? [] : effortOptions;
  const selectedEffort = chosenEffort && availableEfforts.includes(chosenEffort) ? chosenEffort : availableEfforts.at(-1);
  const displayModel = (id: string) => modelOptions?.find(option => option.id === id)?.name ?? modelLabel(id);
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(text: string) {
    if (submitting.current || !onSubmit || !model && !allowUnconfiguredSubmit) return;
    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (await onSubmit(text, model, {
        mode: sessionMode ?? chosenMode,
        ...(sessionMode || effort || selectedEffort === undefined ? {} : {effort: selectedEffort}),
      }) !== false) setValue('');
    } catch {
      setSubmitError('Could not confirm delivery. Check the conversation before sending again.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }
  // Voice support is only known in the browser, so the mic renders after mount
  // to keep the server and client HTML identical.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isGlass = variant === 'glass';
  const disabled = isDisabled || isSubmitting || !onSubmit || !model && !allowUnconfiguredSubmit;

  return (
    <div
      className={`workspace-composer w-full text-left ${isGlass ? 'drop-shadow-[0_18px_38px_rgba(38,38,38,0.18)] backdrop-blur-2xl backdrop-saturate-150' : ''} ${className}`}
      style={isGlass ? glassTheme : composerTheme}>
      <ChatComposer
        density={compact ? "balanced" : "spacious"}
        elevation="none"
        aria-label={label}
        value={value}
        onChange={text => { if (!submitting.current) setValue(text); }}
        isDisabled={disabled}
        onSubmit={text => { void submit(text); }}
        placeholder={placeholder}
        input={<ChatComposerInput handleRef={inputRef}
          onKeyDown={event => {
            if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
            // The library clears its editable DOM synchronously on Enter.
            // Own this path so a rejected/uncertain write preserves the draft.
            event.preventDefault();
            if (isDisabled || isSubmitting || !value.trim()) return;
            void submit(value.trim());
          }}
          style={{minHeight: compact ? 56 : 96, maxHeight: 200, overflowY: 'auto'}} />}
        footerActions={
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
          {sessionModel ? <span className="max-w-48 truncate rounded-lg px-2 py-1.5 text-[12px] font-medium text-ink/60" title={sessionModel}>{displayModel(sessionModel)}</span> :
          models.length > 0 ? <ComposerSelect label="Agent model" value={model} options={models.map(id => ({value: id, label: displayModel(id), description: modelOptions?.find(option => option.id === id)?.efforts.length ? 'Adjustable reasoning · Available to your account' : 'Default reasoning · Available to your account'}))} onChange={setModel} /> :
          <span className="text-[12px] text-muted">{allowUnconfiguredSubmit ? "Sign in to choose a model" : "Available models could not be loaded."}</span>}
          {effort && <span className="shrink-0 rounded-lg px-2 py-1.5 text-[12px] capitalize text-ink/45" title="This session's reasoning setting">{availableEfforts.length > 0 ? `${effort} effort` : 'Default reasoning'}</span>}
          {sessionMode && <span className="shrink-0 rounded-lg px-2 py-1.5 text-[12px] capitalize text-ink/45">{sessionMode}</span>}
          {sessionControls && !sessionMode && <ComposerSelect label="Session mode" value={chosenMode} onChange={value => setMode(value as SessionMode)} options={[
            {value: 'build', label: 'Build', description: 'Edit files, run tools, and build your project'},
            {value: 'plan', label: 'Plan', description: 'Explore the project and return a read-only plan'},
          ]} />}
          {sessionControls && !effort && selectedEffort && <ComposerSelect label="Reasoning effort" value={selectedEffort} onChange={value => setEffort(value as AiEffort)}
            options={availableEfforts.map(value => ({value, label: `${value[0].toUpperCase()}${value.slice(1)} effort`, description: {
              low: 'Prioritize speed and lower token usage', standard: 'Balance depth, speed, and token usage',
              high: 'More thorough reasoning for complex tasks', xhigh: 'Deep reasoning for the most demanding tasks',
            }[value]}))} />}
          {queuedCount > 0 && <span className="shrink-0 text-[12px] text-muted">{queuedCount} queued</span>}
          </div>
        }
        sendActions={<>
          {isMounted && !disabled ? <ChatDictationButton dictation={dictation} /> : null}
          {isWorking && onStop && <button type="button" onClick={onStop} disabled={isStopping}
            aria-label={isStopping ? 'Stopping agent' : 'Stop agent'} title={isStopping ? 'Stopping…' : 'Stop agent'}
            className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-line/40 disabled:opacity-50">
            <IconPlayerStop aria-hidden="true" size={16} />
          </button>}
        </>}
        sendButton={<button type="button" onClick={() => { void submit(value.trim()); }}
          disabled={disabled || !value.trim()} aria-label={isSubmitting ? 'Sending message' : isWorking ? 'Queue follow-up' : 'Send'}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-opacity disabled:opacity-35">
          {isSubmitting ? <IconLoader2 aria-hidden="true" size={17} className="animate-spin motion-reduce:animate-none" /> : <IconArrowUp aria-hidden="true" size={17} />}
        </button>}
      />
      <span role="status" aria-live="polite" className="sr-only">{isSubmitting ? 'Sending message' : announcement}</span>
      {(error || submitError) && <p role="alert" className="mt-2 text-[13px] leading-5 text-accent">{error || submitError}</p>}
    </div>
  );
}
