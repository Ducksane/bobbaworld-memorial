type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Renders a JSON-LD script; `<` is escaped so the payload cannot close the tag. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
