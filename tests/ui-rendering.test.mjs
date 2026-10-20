import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const sourceUrl = new URL("../src/components/ui.tsx", import.meta.url);
const require = createRequire(sourceUrl);
const compiled = ts.transpileModule(readFileSync(sourceUrl, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const component = { exports: {} };
new Function("require", "module", "exports", compiled)(
  require,
  component,
  component.exports,
);
const { Reveal, CodeBlock } = component.exports;

test("reveal content is readable in server HTML before JavaScript starts", () => {
  const html = renderToStaticMarkup(
    createElement(
      Reveal,
      { delay: 0.4 },
      createElement("h2", null, "Readable without JavaScript"),
    ),
  );
  assert.match(html, /<h2>Readable without JavaScript<\/h2>/);
  assert.doesNotMatch(
    html,
    /opacity:\s*0(?:[;"\s]|$)|visibility:\s*hidden|display:\s*none/,
  );
});

test("code remains available as a named keyboard-scrollable region", () => {
  const html = renderToStaticMarkup(
    createElement(CodeBlock, {
      code: "example command",
      label: "Install",
      language: "bash",
    }),
  );
  assert.match(
    html,
    /<pre[^>]*tabindex="0"[^>]*role="region"[^>]*aria-label="Install code, bash"/,
  );
  assert.match(html, /<code>example command<\/code>/);
});
