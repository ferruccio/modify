import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

await new Command()
  .name("modify")
  .version("0.1.0")
  .description("Generate mod.ts (or mod.js) file for Deno project")
  .option("-p, --path [path]", "source path", { default: "./" })
  .option("-j, --javascript", "export javascript module")
  .action(async ({ path, javascript }) => {
    await generateExports(path as string, javascript ? ".js" : ".ts");
  })
  .parse(Deno.args);

async function generateExports(path: string, suffix: string) {
  const modfile = `mod${suffix}`;

  const file = await Deno.open(join(path, modfile), {
    create: true,
    write: true,
    truncate: true,
  });
  const encoder = new TextEncoder();
  const entries = walk(path as string, {
    includeDirs: false,
    maxDepth: 1,
  });
  for await (const entry of entries) {
    if (entry.name.endsWith(suffix) && entry.name !== modfile)
      await file.write(encoder.encode(`export * from "./${entry.name}"\n`));
  }
  Deno.close(file.rid);
}
