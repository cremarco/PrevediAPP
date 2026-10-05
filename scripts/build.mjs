import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

// dist contains generated output only. Cleaning prevents obsolete chunks from shipping.
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("index.html", "dist/index.html");
await cp("assets", "dist/assets", {
  recursive: true,
  filter: (source) => !source.endsWith(".js") && !source.endsWith("/js"),
});
const result = await build({
  entryPoints: ["assets/app.js"],
  outdir: "dist/assets",
  entryNames: "app",
  chunkNames: "chunks/[name]-[hash]",
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2022",
  minify: true,
  metafile: true,
  legalComments: "inline",
});
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
