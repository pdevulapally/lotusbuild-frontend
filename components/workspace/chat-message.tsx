import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// No raw HTML plugins. Markdown links are filtered before becoming DOM URLs;
// images remain links so agent output cannot trigger third-party tracking loads.
export function messageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol) && !parsed.username && !parsed.password ? url : "";
  } catch { return url.startsWith("#") ? url : ""; }
}

export function ChatMessage({content}: {content: string}) {
  return (
    <div className="chat-message min-w-0 text-ink">
      <Markdown skipHtml remarkPlugins={[remarkGfm]} urlTransform={messageUrl}
        components={{
          a: ({href, children}) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
          img: ({src, alt}) => typeof src === "string" && src ? <a href={src} target="_blank" rel="noopener noreferrer">{alt || "View image"}</a> : <span>{alt}</span>,
          table: ({children}) => <div className="overflow-x-auto"><table>{children}</table></div>,
        }}>
        {content}
      </Markdown>
    </div>
  );
}
