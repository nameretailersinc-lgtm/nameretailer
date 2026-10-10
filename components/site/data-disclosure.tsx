export const validAsOf = (value?: string) =>
  !!value && Number.isFinite(Date.parse(value));

export function DataDisclosure({ asOf }: { asOf?: string }) {
  if (!validAsOf(asOf)) return null;
  return (
    <p className="catalogue-data-disclosure">
      Catalogue data is owner-supplied, not independently verified; as of{" "}
      <time dateTime={asOf}>
        {new Date(asOf!).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
      </time>
      .
    </p>
  );
}
