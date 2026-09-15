/**
 * Renders one JSON-LD block. The only place in the codebase allowed to use
 * `dangerouslySetInnerHTML`, because a `<script>` body is text, not children —
 * React would escape `&` and `"` into entities and the JSON would no longer
 * parse.
 *
 * What makes that safe here is the escaping below plus the input: every object
 * passed in is built in lib/schema.ts from lib/data.ts, never from a request,
 * a query string or model output.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // A `</script>` sequence inside a string value would end the tag early and
  // hand the rest of the JSON to the HTML parser. `<` has no special meaning
  // in JSON, so escaping it costs nothing and closes that door.
  const json = JSON.stringify(data).replace(/</g, "\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
