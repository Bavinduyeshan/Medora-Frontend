import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const standalone = resolve(".next/standalone");
if (!existsSync(resolve(standalone, "server.js")))
  throw new Error("Run npm run build before npm start.");
mkdirSync(resolve(standalone, ".next"), { recursive: true });
cpSync(resolve(".next/static"), resolve(standalone, ".next/static"), {
  recursive: true,
});
if (existsSync("public"))
  cpSync(resolve("public"), resolve(standalone, "public"), { recursive: true });
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
await import(pathToFileURL(resolve(standalone, "server.js")).href);
