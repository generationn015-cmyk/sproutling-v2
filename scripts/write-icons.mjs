import { readFileSync, writeFileSync } from "node:fs";
const png = Buffer.from(readFileSync(new URL("./icon.b64", import.meta.url), "utf8"), "base64");
for (const name of ["icon-180.png", "icon-192.png", "icon-512.png"]) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png);
}
