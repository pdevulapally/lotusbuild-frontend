'use client';

import {useRef, useState, useSyncExternalStore} from 'react';
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatDictationButton,
  useChatDictation,
  type ChatComposerInputHandle,
} from '@astryxdesign/core/Chat';
import {Token} from '@astryxdesign/core/Token';
import type {CSSProperties} from 'react';

// Model IDs from the backend's ai.model.allowlist.
const AGENT_MODELS = ['claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-5'];

// Agent model picker: pill trigger with a floating, check-marked menu.
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
        className="flex items-center gap-2 rounded-full border border-line bg-paper py-2 pl-3 pr-3.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-ink">
        {value}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Agent model"
          className="absolute bottom-full left-0 z-20 mb-2 w-60 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-[0_16px_40px_-12px_rgba(38,38,38,0.25)]">
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
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors duration-150 ${
                    selected ? 'bg-line/60 text-ink' : 'text-muted hover:bg-line/40 hover:text-ink'
                  }`}>
                  <span className="flex items-center gap-2.5">
                    {option}
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
                      strokeLinejoin="round">
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
  '--color-background-surface': '#f7f5f3',
  '--color-background-card': '#f7f5f3',
  '--color-background-muted': '#efebe7',
  '--color-border': '#d6d0ca',
  '--color-border-emphasized': '#262626',
  '--color-text-primary': '#262626',
  '--color-text-secondary': '#5c5854',
  '--color-accent': '#262626',
} as CSSProperties;

type AiInputProps = {
  label: string;
  placeholder?: string;
  attachments?: string[];
  examples?: {label: string; prompt: string}[];
  onSubmit?: (value: string) => void;
  className?: string;
};

// Composer with an attachment tray, text input, and voice input.
// Mode, reference, and settings controls are intentionally not included.
export function AiInput({
  label,
  placeholder = 'Ask anything',
  attachments = [],
  examples = [],
  onSubmit,
  className = '',
}: AiInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<ChatComposerInputHandle>(null);
  const dictation = useChatDictation({inputRef});
  const [model, setModel] = useState(AGENT_MODELS[1]);
  // Voice support is only known in the browser, so the mic renders after mount
  // to keep the server and client HTML identical.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className={`w-full text-left ${className}`} style={composerTheme}>
      <ChatComposer
        density="spacious"
        aria-label={label}
        value={value}
        onChange={setValue}
        onSubmit={text => {
          onSubmit?.(text);
          setValue('');
        }}
        placeholder={placeholder}
        drawer={
          attachments.length > 0 ? (
            <ChatComposerDrawer count={attachments.length}>
              {attachments.map(name => (
                <Token key={name} label={name} />
              ))}
            </ChatComposerDrawer>
          ) : undefined
        }
        input={<ChatComposerInput handleRef={inputRef} style={{minHeight: 96}} />}
        footerActions={
          <ModelSelect value={model} options={AGENT_MODELS} onChange={setModel} />
        }
        sendActions={isMounted ? <ChatDictationButton dictation={dictation} /> : null}
      />
      {examples.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Example project prompts">
          <span className="mr-1 text-xs text-muted">Try an idea</span>
          {examples.map(example => (
            <button
              key={example.label}
              type="button"
              onClick={() => {
                setValue(example.prompt);
                inputRef.current?.focus();
              }}
              className="min-h-11 rounded-full border border-line px-4 py-2 text-xs text-muted transition-colors hover:border-ink hover:bg-white/60 hover:text-ink">
              {example.label} <span aria-hidden="true" className="ml-1">↗</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
