import { existsSync, readFileSync, writeFileSync } from "node:fs";
const payload = new URL("./icon.b64", import.meta.url);
if (!existsSync(payload)) process.exit(0);
const png = Buffer.from(readFileSync(payload, "utf8"), "base64");
for (const name of ["icon-180.png", "icon-192.png", "icon-512.png"]) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png);
}
