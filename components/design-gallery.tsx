"use client";

import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Panel,
  Badge,
  Feedback,
  PageHeading,
  Empty,
} from "./admin/primitives";

export function DesignGallery() {
  const [selected, setSelected] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <>
      <PageHeading
        title="Workspace design system"
        description="Private component review — illustrative states, no fabricated business data."
      />
      <div className="grid-two">
        <Panel title="Typography & palette">
          <h3 className="workspace-type-sample">
            Editorial headlines. Practical details.
          </h3>
          <p>
            Clear type, calm surfaces, and emerald actions keep the workspace
            focused. Use the theme control to review these components in dark
            mode.
          </p>
          <div className="palette-grid">
            {[
              ["Canvas", "#f5f8fb"],
              ["Ink", "#111d30"],
              ["Emerald", "#00845c"],
              ["Focus", "#008b60"],
              ["Danger", "#bd3448"],
            ].map(([label, color]) => (
              <div key={label}>
                <span
                  className="palette-swatch"
                  style={{ background: color }}
                />
                <strong>{label}</strong>
                <p className="small">{color}</p>
              </div>
            ))}
          </div>
          <Badge>Neutral status label</Badge>
        </Panel>
        <Panel title="Buttons & states">
          <div className="actions">
            <Button onClick={() => setShow(true)}>Primary action</Button>
            <Button
              variant="secondary"
              onClick={() => setSelected(!selected)}
              aria-pressed={selected}
            >
              {selected ? "Selected" : "Secondary action"}
            </Button>
            <Button variant="danger" onClick={() => setShow(true)}>
              Danger action demo
            </Button>
            <Button disabled>Disabled</Button>
            <Button disabled>Saving…</Button>
          </div>
          <p className="small">
            Use Tab to inspect focus. Labels describe actual state; color is
            never the sole signal.
          </p>
          {show && (
            <Feedback success="Demo action activated. No database change was made." />
          )}
        </Panel>
        <Panel title="Fields">
          <Field
            label="Example field"
            hint="Visible instructions, not placeholder-only labels."
          >
            <Input placeholder="Illustrative input" />
          </Field>
          <Field label="Example error" hint="Enter a valid value.">
            <Input aria-invalid="true" defaultValue="Needs review" />
          </Field>
          <Field label="Disabled field">
            <Input disabled value="Unavailable in this demo" readOnly />
          </Field>
          <Feedback error="Illustrative error state. No failed network request occurred." />
        </Panel>
        <Panel title="Empty & data states">
          <Empty>No example records. This is an explicit empty state.</Empty>
          <div className="table-container">
            <table>
              <caption>
                Illustrative component structure — no real inventory metrics
              </caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  <th scope="col">State</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Example unpublished draft</th>
                  <td>
                    <Badge>draft</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
