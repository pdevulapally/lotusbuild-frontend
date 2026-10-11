'use client';

import {useRef, useState, useSyncExternalStore} from 'react';
import {
  ChatComposer,
  ChatComposerInput,
  ChatDictationButton,
  useChatDictation,
  type ChatComposerInputHandle,
} from '@astryxdesign/core/Chat';
import type {CSSProperties} from 'react';
import {IconArrowUp, IconLoader2, IconPlayerStop} from '@tabler/icons-react';

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

// The options are supplied by the authenticated account's backend capability
// allowlist. The picker only presents that catalogue; it never invents models.
function ModelSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape') setIsOpen(false);
      }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className="group flex max-w-52 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-ink/65 transition-colors duration-150 hover:bg-ink/5 hover:text-ink">
        <span className="truncate">{modelLabel(value)}</span>
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-ink/45 transition-transform duration-150 group-hover:text-ink/70 ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M2.25 3.75 5 6.5l2.75-2.75" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Agent model"
          className="absolute bottom-full left-0 z-20 mb-2 w-72 overflow-hidden rounded-xl border border-line/80 bg-paper p-1.5 shadow-[0_18px_50px_-18px_rgba(38,38,38,0.4)]">
          <li aria-hidden="true" className="px-2.5 pb-2 pt-1.5">
            <p className="text-[12px] font-semibold text-ink">Select model</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">Available to your account</p>
          </li>
          {options.map(option => {
            const selected = option === value;
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
                    selected ? 'bg-line/55 text-ink' : 'text-ink/70 hover:bg-line/35 hover:text-ink'
                  }`}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium">{modelLabel(option)}</span>
                    <span className="truncate text-[10px] text-muted">{option}</span>
                  </span>
                  {selected && (
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0">
                      <path d="M2.5 7.5l3 3 6-6.5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// LotusBuild palette (matches app/globals.css) applied to the composer's tokens.
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

// Same palette, translucent — for placing the composer over a photo (its
// backdrop-blur needs a see-through background to actually blur anything).
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
  onSubmit?: (value: string, model: string) => boolean | void | Promise<boolean | void>;
  models?: string[];
  sessionModel?: string;
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
  sessionModel,
  compact = false,
  allowUnconfiguredSubmit = false,
  variant = 'default',
  className = '',
}: AiInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<ChatComposerInputHandle>(null);
  const dictation = useChatDictation({inputRef});
  const [chosenModel, setModel] = useState('');
  const model = sessionModel ?? (models.includes(chosenModel) ? chosenModel : models[0] ?? '');
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(text: string) {
    if (submitting.current || !onSubmit || !model && !allowUnconfiguredSubmit) return;
    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (await onSubmit(text, model) !== false) setValue('');
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
          <div className="flex min-w-0 items-center gap-3">
          {sessionModel ? <span className="truncate px-2 py-1.5 text-[12px] font-medium text-ink/55">{modelLabel(sessionModel)}</span> :
          models.length > 0 ? <ModelSelect value={model} options={models} onChange={setModel} /> :
          <span className="text-[12px] text-muted">{allowUnconfiguredSubmit ? "Sign in to choose a model" : "Available models could not be loaded."}</span>}
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
