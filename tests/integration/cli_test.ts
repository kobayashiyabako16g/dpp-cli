import { assertEquals } from "@std/assert";
import { join } from "@std/path";

// Integration test for CLI help
Deno.test({
  name: "Integration: dpp --help shows usage",
  async fn() {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        join(Deno.cwd(), "main.ts"),
        "--help",
      ],
      cwd: Deno.cwd(),
    });

    const { code, stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    assertEquals(code, 0);
    assertEquals(output.includes("dpp"), true);
    assertEquals(output.includes("init"), true);
    assertEquals(output.includes("add"), true);
    assertEquals(output.includes("remove"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for no command
Deno.test({
  name: "Integration: dpp without command shows help",
  async fn() {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        join(Deno.cwd(), "main.ts"),
      ],
      cwd: Deno.cwd(),
    });

    const { code, stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    assertEquals(code, 0);
    assertEquals(output.includes("Dark powered plugin manager CLI"), true);
    assertEquals(output.includes("Commands:"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
