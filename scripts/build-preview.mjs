import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";

const dist = resolve("dist");
const mime = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
function embed(url) {
  const path = resolve(dist, url.replace(/^\//, ""));
  if (!path.startsWith(dist + "/")) throw new Error("Asset outside dist");
  return `data:${mime[extname(path)] || "application/octet-stream"};base64,${readFileSync(path).toString("base64")}`;
}
const hero = embed("/images/family-garden.webp");
let html = readFileSync(resolve(dist, "index.html"), "utf8");
html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
  (_tag, src) => {
    const js = readFileSync(resolve(dist, src.slice(1)), "utf8")
      .replaceAll("/images/family-garden.webp", hero)
      .replaceAll("</script", "<\\/script");
    return `<script>window.__PCMR_STANDALONE_PREVIEW__=true;</script><script type="module">${js}</script>`;
  },
);
html = html.replace(
  /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
  (_tag, href) => {
    const css = readFileSync(resolve(dist, href.slice(1)), "utf8").replace(
      /url\(([^)]+)\)/g,
      (match, raw) => {
        const url = raw.replace(/^['"]|['"]$/g, "");
        return url.startsWith("/assets/") ? `url("${embed(url)}")` : match;
      },
    );
    return `<style>${css}</style>`;
  },
);
html = html
  .replaceAll('href="/favicon.svg"', `href="${embed("/favicon.svg")}"`)
  .replaceAll('href="/images/family-garden.webp"', `href="${hero}"`);
if (/<(?:script|link)[^>]+(?:src|href)="\/assets\//.test(html))
  throw new Error("Unresolved assets in standalone preview");
mkdirSync(resolve("artifacts"), { recursive: true });
writeFileSync(resolve("artifacts/pcmr-preview.html"), html);
console.log(
  "Created artifacts/pcmr-preview.html — interactive, offline, no external requests.",
);
