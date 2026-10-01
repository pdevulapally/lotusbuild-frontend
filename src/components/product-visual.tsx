import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Folder,
  Monitor,
  Terminal,
  MessageSquare,
  PanelLeft,
} from "lucide-react";
import type { ReactNode } from "react";

export function Landscape({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`landscape ${className}`}>
      <div className="landscape-image" aria-hidden="true" />
      <div className="landscape-content">{children}</div>
    </div>
  );
}

export function PromptVisual({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`prompt-visual ${large ? "prompt-visual--large" : ""}`}
      aria-label="Illustration of a project brief"
    >
      <div className="visual-topline">
        <span>
          <span className="small-dot" /> LotusBuild
        </span>
        <span>Project brief</span>
      </div>
      <p className="prompt-sentence">
        Describe the software
        <br />
        you want to build
        <span className="typing-cursor" aria-hidden="true" />.
      </p>
      <div className="visual-controls" aria-hidden="true">
        <span className="visual-chip">
          <Code2 size={16} /> Web project
        </span>
        <span className="send-circle">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </div>
  );
}

export function ProductVisual({
  kind,
}: {
  kind: "workflow" | "desktop" | "project";
}) {
  if (kind === "workflow")
    return (
      <Landscape>
        <div
          className="workflow-visual"
          aria-label="From brief to code to preview"
        >
          {[
            { Icon: MessageSquare, label: "Describe your idea" },
            { Icon: Code2, label: "Build with your agent" },
            { Icon: Monitor, label: "Review the preview" },
          ].map(({ Icon, label }, i) => (
            <div key={label}>
              <div className="workflow-node">
                <Icon size={20} />
                <span>{label}</span>
                <span className="node-index">0{i + 1}</span>
              </div>
              {i < 2 && (
                <ArrowDown
                  className="workflow-arrow"
                  size={20}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </Landscape>
    );
  if (kind === "desktop")
    return (
      <Landscape>
        <div
          className="desktop-visual"
          aria-label="Illustration of the cloud desktop"
        >
          <div className="window-bar">
            <span className="window-dots">
              <i />
              <i />
              <i />
            </span>
            <span>Cloud desktop</span>
            <Monitor size={14} />
          </div>
          <div className="desktop-content">
            <div className="desktop-sidebar">
              <Terminal size={20} />
              <Folder size={20} />
              <Code2 size={20} />
            </div>
            <div className="desktop-message">
              <Monitor size={35} strokeWidth={1} />
              <h4>A view into the work.</h4>
              <p>Browser. Terminal. Source code.</p>
              <span className="visual-chip">E2B sandbox</span>
            </div>
          </div>
        </div>
      </Landscape>
    );
  return (
    <Landscape>
      <div
        className="project-visual"
        aria-label="Illustration of project organisation"
      >
        <div className="window-bar">
          <PanelLeft size={16} />
          <span>Your workspace</span>
          <span className="small-dot" />
        </div>
        <div className="project-visual-body">
          <Folder size={30} strokeWidth={1.2} />
          <h4>One place for your projects.</h4>
          <p>Your ideas, organised.</p>
          <div className="project-file">
            <Code2 size={17} />
            <span>Source files</span>
          </div>
          <div className="project-file">
            <Monitor size={17} />
            <span>Project preview</span>
          </div>
          <div className="project-file">
            <Terminal size={17} />
            <span>Cloud environment</span>
          </div>
        </div>
      </div>
    </Landscape>
  );
}
