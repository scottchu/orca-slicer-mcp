import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const releaseConfig = JSON.parse(
  readFileSync(new URL("../../.mcp.release.json", import.meta.url), "utf8")
);
const developerConfig = JSON.parse(
  readFileSync(new URL("../../.mcp.json", import.meta.url), "utf8")
);
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);
const packaging = readFileSync(
  new URL("../../PACKAGING.md", import.meta.url),
  "utf8"
);

describe("local-first packaging contract", () => {
  test("uses one runtime entrypoint without Bun or environment-file setup", () => {
    const release = releaseConfig.mcpServers["u1-print-studio"];
    expect(release.command).toBe("./app/runtime/u1-print-studio");
    expect(release.args).toEqual(["mcp"]);
    expect(JSON.stringify(release)).not.toContain("bun");
    expect(JSON.stringify(release)).not.toContain("env-file");
    expect(JSON.stringify(release)).not.toContain("tailscale");
  });

  test("shares setup and doctor across all three future delivery adapters", () => {
    expect(packageJson.scripts.setup).toBe("bun run src/cli.ts setup");
    expect(packageJson.scripts.doctor).toBe("bun run src/cli.ts doctor");
    expect(packageJson.scripts["bundle:runtime"]).toBe(
      "bun run src/build-runtime.ts"
    );
    for (const channel of ["Marketplace", "Homebrew", "npm"]) {
      expect(packaging).toContain(`| ${channel} |`);
    }
    expect(packaging).toContain("`u1-print-studio setup`");
    expect(packaging).toContain("`u1-print-studio doctor`");
  });

  test("keeps Bun and env files confined to the source developer adapter", () => {
    const developer = developerConfig.mcpServers["u1-print-studio"];
    expect(developer.command).toBe("bun");
    expect(developer.args).toContain("--env-file=../../.env");
    expect(developer.args).toContain("./app/src/stdio-main.ts");
  });
});
