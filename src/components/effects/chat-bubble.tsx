import type { CSSProperties } from "react";

type ChatBubbleProps = {
  /** Head-only avatar, 27 × 30 like habbo-imaging's `size=s&headonly=1`. */
  head: string;
  /** "Vous :", "TheStaff :"… — the speaker, with its punctuation. */
  speaker: string;
  text: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * A speech bubble as Habbo drew them: the speaker's head in a grey box on the
 * left, a dark divider with a notch pointing at it, then "Name: message" on
 * white. The shape and colours live in `globals.css` under `.bw-bubble`.
 */
export function ChatBubble({ head, speaker, text, className = "", style }: ChatBubbleProps) {
  return (
    <p role="status" className={`bw-bubble ${className}`} style={style}>
      <span aria-hidden className="bw-bubble-head">
        {/* eslint-disable-next-line @next/next/no-img-element -- 27px pixel
            art that the image optimiser would only blur */}
        <img src={head} alt="" width={27} height={30} />
      </span>
      <span className="bw-bubble-text">
        <b>{speaker}</b> {text}
      </span>
    </p>
  );
}
