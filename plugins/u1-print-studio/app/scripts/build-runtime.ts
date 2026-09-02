import path from "node:path";

const appRoot = path.resolve(import.meta.dir, "..");
const output = path.join(appRoot, "dist", "u1-print-studio");
const target = process.env.U1_RUNTIME_TARGET?.trim() || "bun-darwin-arm64";

async function run(command: string[]): Promise<void> {
  const child = Bun.spawn({
    cmd: command,
    cwd: appRoot,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await child.exited;
  if (status !== 0) {
    throw new Error(`${command[0]} exited with status ${status}`);
  }
}

await run([
  process.execPath,
  "build",
  "src/entrypoints/cli.ts",
  "--compile",
  `--target=${target}`,
  "--no-compile-autoload-dotenv",
  "--no-compile-autoload-bunfig",
  `--outfile=${output}`,
]);

if (process.platform === "darwin" && target.startsWith("bun-darwin-")) {
  // Bun 1.3.12 can emit an invalid embedded signature on current macOS.
  // Replace it with a locally runnable ad-hoc signature for validation only.
  await run(["codesign", "--remove-signature", output]);
  await run(["codesign", "--force", "--sign", "-", output]);
  await run(["codesign", "-vvv", "--verify", output]);
}
