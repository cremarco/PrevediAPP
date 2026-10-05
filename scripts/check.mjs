import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? filesIn(path) : [path];
    }),
  );
  return nested.flat();
}

const files = (
  await Promise.all(["assets", "scripts", "tests"].map(filesIn))
).flat();
for (const file of files.filter((file) => /\.(?:js|mjs)$/.test(file)).sort()) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const tests = files.filter((file) => file.endsWith(".test.mjs")).sort();
const result = spawnSync(process.execPath, ["--test", ...tests], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
