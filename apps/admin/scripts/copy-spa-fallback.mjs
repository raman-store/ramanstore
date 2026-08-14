import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
await copyFile(join(projectRoot, "dist", "index.html"), join(projectRoot, "dist", "404.html"));
