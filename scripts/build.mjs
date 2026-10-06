import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { build } from "esbuild";

// dist contains generated output only. Cleaning prevents obsolete chunks from shipping.
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("assets", "dist/assets", {
  recursive: true,
  filter: (source) => !source.endsWith(".js") && !source.endsWith("/js"),
});
const result = await build({
  entryPoints: ["assets/app.js"],
  outdir: "dist/assets",
  entryNames: "app-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2022",
  minify: true,
  metafile: true,
  legalComments: "inline",
});
// Version both entry assets so a new HTML document cannot reuse a previous build.
const entry = Object.entries(result.metafile.outputs).find(
  ([, output]) => output.entryPoint === "assets/app.js",
);
if (!entry) throw new Error("Missing application entry in the build output.");
const css = await readFile("dist/assets/app.css");
const cssName = `app-${createHash("sha256").update(css).digest("hex").slice(0, 12)}.css`;
await rename("dist/assets/app.css", `dist/assets/${cssName}`);
const html = await readFile("index.html", "utf8");
await writeFile(
  "dist/index.html",
  html
    .replace('href="assets/app.css"', `href="assets/${cssName}"`)
    .replace('src="assets/app.js"', `src="${entry[0].replace(/^dist\//, "")}"`),
);
await writeFile("dist/.nojekyll", "");
await mkdir(".impeccable/review", { recursive: true });
await writeFile(
  ".impeccable/review/build-metafile.json",
  JSON.stringify(result.metafile, null, 2),
);
const javascriptBytes = Object.values(result.metafile.outputs).reduce(
  (sum, output) => sum + output.bytes,
  0,
);
console.log(
  `App statica pronta in dist/ · JavaScript totale: ${javascriptBytes} byte, con schermate caricate su richiesta.`,
);
