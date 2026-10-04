"use client";

import {useMemo, useState} from "react";
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {IconChevronDown, IconChevronUp, IconMessageQuestion} from "@tabler/icons-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QUESTION_CUSTOM_ID = "__custom__";

function optionBadge(idx: number) {
  return String.fromCharCode(65 + idx);
}

export type QuestionOption = {
  id: string;
  label: string;
  description?: string;
};

export type QuestionConfig = {
  kind: "single" | "multi" | "text";
  title: string;
  description?: string;
  options?: QuestionOption[];
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  minSelections?: number;
  maxSelections?: number;
  placeholder?: string;
};

export type QuestionAnswer = {
  kind: "single" | "multi" | "text" | "skip";
  selectedIds?: string[];
  text?: string;
};

export type QuestionPromptProps = {
  questions: QuestionConfig[];
  questionIndex?: number;
  totalQuestions?: number;
  onPreviousQuestion?: () => void;
  onNextQuestion?: () => void;
  initialAnswer?: QuestionAnswer;
  submitLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  allowSkip?: boolean;
  onSubmit: (answer: QuestionAnswer) => void;
  onSkip?: () => void;
  className?: string;
};

export function QuestionPrompt({
  questions,
  questionIndex = 1,
  totalQuestions,
  onPreviousQuestion,
  onNextQuestion,
  submitLabel = "Send",
  nextLabel = "Next",
  skipLabel = "Skip",
  allowSkip = true,
  initialAnswer,
  onSubmit,
  onSkip,
  className,
}: QuestionPromptProps) {
  const resolvedTotal = totalQuestions ?? questions.length;
  const clampedIndex = Math.max(1, Math.min(questionIndex, resolvedTotal));
  const activeQuestion = questions[clampedIndex - 1];
  const customEnabled = activeQuestion?.allowCustom ?? false;

  // This component remounts per question (see the key in QuestionTool), so the
  // saved answer seeds the state once here instead of through an effect.
  const [seed] = useState(() => {
    const isText = activeQuestion?.kind === "text";
    if (!initialAnswer || initialAnswer.kind === "skip") {
      return {selectedIds: [] as string[], customText: "", textValue: ""};
    }
    if (isText) {
      return {selectedIds: [] as string[], customText: "", textValue: initialAnswer.text ?? ""};
    }
    const nextSelected = new Set(initialAnswer.selectedIds ?? []);
    const nextCustomText = initialAnswer.text ?? "";
    if (customEnabled && nextCustomText.trim().length > 0) nextSelected.add(QUESTION_CUSTOM_ID);
    return {selectedIds: Array.from(nextSelected), customText: nextCustomText, textValue: ""};
  });
  const [selectedIds, setSelectedIds] = useState<string[]>(seed.selectedIds);
  const [customText, setCustomText] = useState(seed.customText);
  const [textValue, setTextValue] = useState(seed.textValue);
  const showNav = resolvedTotal > 1 && (!!onPreviousQuestion || !!onNextQuestion);
  const canGoPrev = clampedIndex > 1;
  const canGoNext = clampedIndex < resolvedTotal;
  const isLastQuestion = clampedIndex >= resolvedTotal;
  const primaryLabel = isLastQuestion ? submitLabel : nextLabel;

  const canSubmit = useMemo(() => {
    if (activeQuestion?.kind === "text") return textValue.trim().length > 0;
    const selectedNonCustom = selectedIds.filter(id => id !== QUESTION_CUSTOM_ID).length;
    const hasCustomText = customText.trim().length > 0;
    const total = selectedNonCustom + (hasCustomText ? 1 : 0);
    if (activeQuestion?.kind === "single") return total === 1;
    const min = activeQuestion?.minSelections ?? 1;
    const max = activeQuestion?.maxSelections;
    if (total < min) return false;
    if (typeof max === "number" && total > max) return false;
    return total > 0;
  }, [
    activeQuestion?.kind,
    activeQuestion?.minSelections,
    activeQuestion?.maxSelections,
    selectedIds,
    customText,
    textValue,
  ]);

  const toggleMulti = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleCustomTextChange = (nextValue: string) => {
    setCustomText(nextValue);
    if (!activeQuestion) return;
    if (activeQuestion.kind === "single") {
      setSelectedIds(nextValue.trim().length > 0 ? [QUESTION_CUSTOM_ID] : []);
      return;
    }
    setSelectedIds(prev => {
      const hasCustom = prev.includes(QUESTION_CUSTOM_ID);
      if (nextValue.trim().length > 0 && !hasCustom) return [...prev, QUESTION_CUSTOM_ID];
      if (nextValue.trim().length === 0 && hasCustom) return prev.filter(id => id !== QUESTION_CUSTOM_ID);
      return prev;
    });
  };

  const handleSubmit = () => {
    if (!canSubmit || !activeQuestion) return;
    if (activeQuestion.kind === "text") {
      onSubmit({kind: "text", text: textValue.trim()});
      return;
    }
    const selectedNonCustom = selectedIds.filter(id => id !== QUESTION_CUSTOM_ID);
    const answerText = customText.trim() || undefined;
    onSubmit({kind: activeQuestion.kind, selectedIds: selectedNonCustom, text: answerText});
  };

  const handleSkip = () => {
    onSkip?.();
    onSubmit({kind: "skip"});
  };

  if (!activeQuestion) return null;

  const optionRow =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-line/40";
  const badgeBase =
    "flex h-6 min-w-6 items-center justify-center rounded-lg border px-1.5 font-mono text-[12px] transition-colors duration-150";
  const badgeOff = "border-line text-muted";
  const badgeOn = "border-ink-strong bg-ink-strong text-paper";

  return (
    <div className={cn("flex flex-col gap-3 px-4 py-4", className)}>
      <div className="flex items-start gap-2.5">
        <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-line px-1 text-[12px] text-muted">
          {clampedIndex}
        </span>
        <p className="text-[15px] leading-6 text-ink">{activeQuestion.title}</p>
      </div>

      {activeQuestion.kind !== "text" && (activeQuestion.options?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-1">
          {activeQuestion.options!.map((option, idx) => {
            const checked = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (activeQuestion.kind === "single") {
                    setSelectedIds([option.id]);
                    if (customEnabled) setCustomText("");
                  } else {
                    toggleMulti(option.id);
                  }
                }}
                className={optionRow}>
                <span className={cn(badgeBase, checked ? badgeOn : badgeOff)}>{optionBadge(idx)}</span>
                <span className="text-[14px] text-ink">
                  {option.label}
                  {option.description && <span className="text-muted"> {option.description}</span>}
                </span>
              </button>
            );
          })}

          {customEnabled && (
            <div className="mt-1 flex items-center gap-3 px-3 py-1.5">
              <span
                className={cn(
                  badgeBase,
                  selectedIds.includes(QUESTION_CUSTOM_ID) ? badgeOn : badgeOff,
                )}>
                {optionBadge(activeQuestion.options!.length)}
              </span>
              <input
                value={customText}
                onChange={event => handleCustomTextChange(event.target.value)}
                placeholder={activeQuestion.customPlaceholder ?? "Type your answer"}
                className="h-8 w-full border-b border-line bg-transparent text-[14px] text-ink outline-none placeholder:text-muted/70 focus:border-ink"
              />
            </div>
          )}
        </div>
      )}

      {activeQuestion.kind === "text" && (
        <textarea
          value={textValue}
          onChange={event => setTextValue(event.target.value)}
          placeholder={activeQuestion.placeholder ?? "Type your answer"}
          rows={3}
          className="w-full resize-y rounded-xl border border-line bg-page px-3 py-2 text-[14px] text-ink outline-none placeholder:text-muted/70 focus:border-ink"
        />
      )}

      <div className={cn("flex items-center gap-2", showNav ? "justify-between" : "justify-end")}>
        {showNav && (
          <div className="flex items-center gap-2">
            {onPreviousQuestion && (
              <button
                type="button"
                onClick={onPreviousQuestion}
                disabled={!canGoPrev}
                className="h-8 rounded-full px-3 text-[13px] text-muted transition-colors duration-150 hover:text-ink disabled:opacity-40">
                Previous
              </button>
            )}
            {onNextQuestion && (
              <button
                type="button"
                onClick={onNextQuestion}
                disabled={!canGoNext}
                className="h-8 rounded-full px-3 text-[13px] text-muted transition-colors duration-150 hover:text-ink disabled:opacity-40">
                Next
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          {allowSkip && (
            <button
              type="button"
              onClick={handleSkip}
              className="h-8 rounded-full px-3 text-[13px] text-muted transition-colors duration-150 hover:text-ink">
              {skipLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-8 rounded-full bg-ink-strong px-4 text-[13px] font-medium text-paper transition-colors duration-150 hover:bg-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-muted">
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatAnswer(answer: QuestionAnswer) {
  if (answer.kind === "skip") return "Skipped";
  if (answer.kind === "text") return answer.text || "Answered";
  const ids = answer.selectedIds?.length ? answer.selectedIds.join(", ") : "";
  if (answer.text) return ids ? `${ids} (${answer.text})` : answer.text;
  return ids || "Answered";
}

export type QuestionToolProps = {
  questions: QuestionConfig[];
  questionIndex?: number;
  totalQuestions?: number;
  onPreviousQuestion?: () => void;
  onNextQuestion?: () => void;
  submitLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  allowSkip?: boolean;
  onSubmitAnswer?: (answer: QuestionAnswer) => void;
  /** When provided, renders the summary state with this answer. */
  output?: {answer?: QuestionAnswer};
  /** Unused internally. Pass it as a React `key` to reset state for a new tool call. */
  toolCallId?: string;
  className?: string;
};

export function QuestionTool({
  questions,
  questionIndex,
  totalQuestions: totalQuestionsProp,
  onPreviousQuestion,
  onNextQuestion,
  submitLabel,
  nextLabel,
  skipLabel,
  allowSkip,
  onSubmitAnswer,
  output,
  className,
}: QuestionToolProps) {
  const totalQuestions = totalQuestionsProp ?? questions.length;
  const [localIndex, setLocalIndex] = useState(questionIndex ?? 1);
  const isControlled = typeof questionIndex === "number";
  const effectiveIndex = isControlled ? (questionIndex ?? 1) : questions.length > 0 ? localIndex : 1;
  const clampedIndex = Math.max(1, Math.min(effectiveIndex, totalQuestions));
  const question = questions[clampedIndex - 1];
  const [localAnswers, setLocalAnswers] = useState<Record<number, QuestionAnswer>>({});

  const outputAnswer = output?.answer;
  const answeredCount = Object.keys(localAnswers).length;
  const isComplete =
    totalQuestions === 1
      ? !!outputAnswer || answeredCount >= 1
      : totalQuestions > 0 && answeredCount >= totalQuestions;
  const showNavigation = totalQuestions > 1 && !isComplete;
  const canGoPrev = clampedIndex > 1;
  const canGoNext = clampedIndex < totalQuestions;

  const summaryAnswers = useMemo(() => {
    if (!isComplete || totalQuestions <= 1) return [];
    return Array.from({length: totalQuestions}, (_, idx) => ({
      index: idx + 1,
      answer: localAnswers[idx + 1],
    }));
  }, [isComplete, localAnswers, totalQuestions]);

  const summaryText = useMemo(() => {
    if (!isComplete) return "";
    if (summaryAnswers.length > 0) {
      return summaryAnswers
        .map(item => `${item.index}: ${item.answer ? formatAnswer(item.answer) : "Pending"}`)
        .join("  ·  ");
    }
    if (outputAnswer) return formatAnswer(outputAnswer);
    if (localAnswers[clampedIndex]) return formatAnswer(localAnswers[clampedIndex]);
    return "Pending";
  }, [isComplete, summaryAnswers, outputAnswer, localAnswers, clampedIndex]);

  const goPrev = () => {
    if (!canGoPrev) return;
    onPreviousQuestion?.();
    if (!isControlled) setLocalIndex(prev => Math.max(1, prev - 1));
  };

  const goNext = () => {
    if (!canGoNext) return;
    onNextQuestion?.();
    if (!isControlled) setLocalIndex(prev => Math.min(totalQuestions, prev + 1));
  };

  if (!question) return null;

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-line bg-paper", className)}>
      <div className="flex h-10 items-center justify-between border-b border-line px-4 text-[13px] text-muted">
        <div className="flex items-center gap-2">
          <IconMessageQuestion className="h-4 w-4" />
          <span>Question</span>
        </div>
        {showNavigation && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-150 hover:bg-line/50 disabled:opacity-40"
              aria-label="Previous question">
              <IconChevronUp className="h-3.5 w-3.5" />
            </button>
            <span className="px-1">
              {clampedIndex} of {totalQuestions}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-150 hover:bg-line/50 disabled:opacity-40"
              aria-label="Next question">
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {isComplete ? (
        <div className="px-4 py-3 text-[14px] leading-6 text-muted">{summaryText}</div>
      ) : (
        <QuestionPrompt
          key={`${clampedIndex}-${question.title}`}
          questions={questions}
          questionIndex={clampedIndex}
          totalQuestions={totalQuestions}
          initialAnswer={localAnswers[clampedIndex]}
          submitLabel={submitLabel}
          nextLabel={nextLabel}
          skipLabel={skipLabel}
          allowSkip={allowSkip}
          onSubmit={nextAnswer => {
            setLocalAnswers(prev => ({...prev, [clampedIndex]: nextAnswer}));
            onSubmitAnswer?.(nextAnswer);
            if (clampedIndex < totalQuestions) goNext();
          }}
        />
      )}
    </div>
  );
}
