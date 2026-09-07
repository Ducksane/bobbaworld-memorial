/**
 * Structural data for the timeline. Copy lives in `messages/*.json`
 * under `Timeline.entries.<id>` and `Timeline.quotes.<id>`.
 */
export type TimelineEntry = {
  id:
    | "opening"
    | "bobbaworld"
    | "v2"
    | "v25Announced"
    | "blackout"
    | "v25Beta"
    | "closure"
    | "relaunch"
    | "secondClosure"
    | "legacy";
  /**
   * Quiet, tighter entries rendered without a year: `"prelude"` attaches to the
   * milestone below it, `"note"` to the milestone above it.
   */
  kind?: "prelude" | "note";
  /** `"end"` marks a closure and turns the timeline dot red. */
  tone?: "end";
  year: string;
  /** Machine-readable value for `<time dateTime>`. */
  dateTime: string;
  /** Quote attached to this entry, keyed under `Timeline.quotes`. */
  quote?: "opening";
};

export const timeline: readonly TimelineEntry[] = [
  { id: "opening", kind: "prelude", year: "2007", dateTime: "2007-05" },
  { id: "bobbaworld", year: "2007", dateTime: "2007-06", quote: "opening" },
  { id: "v2", year: "2011", dateTime: "2011-04" },
  { id: "v25Announced", year: "2013", dateTime: "2013-04-08" },
  { id: "blackout", kind: "note", year: "2013", dateTime: "2013-04-24" },
  { id: "v25Beta", year: "2014", dateTime: "2014-08-11" },
  { id: "closure", tone: "end", year: "2015", dateTime: "2015-10" },
  { id: "relaunch", year: "2016", dateTime: "2016-05-14" },
  { id: "secondClosure", tone: "end", year: "2017", dateTime: "2017-06" },
  { id: "legacy", year: "2025", dateTime: "2025" },
];
