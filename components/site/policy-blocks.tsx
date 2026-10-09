export type PolicyBlock =
  | { type: "h2" | "h3" | "h4" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "links"; items: Array<[label: string, href: string]> }
  | {
      type: "table";
      caption: string;
      columns: string[];
      rows: string[][];
    };

/** Renders owner-approved policy text exactly as stored; no wording lives here. */
export function PolicyBlocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <section className="reference-card policy-text">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return <h2 key={index}>{block.text}</h2>;
          case "h3":
            return <h3 key={index}>{block.text}</h3>;
          case "h4":
            return <h4 key={index}>{block.text}</h4>;
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "links":
            return (
              <ul key={index}>
                {block.items.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} rel="noopener noreferrer">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div className="directory-table-wrap" key={index}>
                <table className="directory-table">
                  <caption>{block.caption}</caption>
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th scope="col" key={column}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, cellIndex) =>
                          cellIndex === 0 ? (
                            <th scope="row" key={cellIndex}>
                              <code>{cell}</code>
                            </th>
                          ) : (
                            <td key={cellIndex}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </section>
  );
}
