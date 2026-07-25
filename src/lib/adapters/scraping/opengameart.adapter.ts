import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { normalizeLicense } from "@lib/adapters/shared/license-map";

const SELECTORS = {
  assetRow: ".asset-list-item",
  name: ".asset-title",
  thumbnail: ".asset-thumb img",
  category: ".asset-type",
  link: ".asset-title a",
  licenseText: ".asset-license",
} as const;

interface OpenGameArtRawItem {
  name: string;
  thumbnail: string;
  category: string;
  link: string;
  licenseText: string;
}

/**
 * Parse OpenGameArt HTML into raw structured items.
 */
export function parseOpenGameArtHtml(html: string): OpenGameArtRawItem[] {
  if (typeof document === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = doc.querySelectorAll(SELECTORS.assetRow);

  return Array.from(rows).map((row) => ({
    name: row.querySelector(SELECTORS.name)?.textContent?.trim() ?? "",
    thumbnail:
      row.querySelector<HTMLImageElement>(SELECTORS.thumbnail)?.src ?? "",
    category:
      row.querySelector(SELECTORS.category)?.textContent?.trim() ?? "",
    link:
      (row.querySelector<HTMLAnchorElement>(SELECTORS.link)?.href as string) ??
      "",
    licenseText:
      row.querySelector(SELECTORS.licenseText)?.textContent?.trim() ?? "",
  }));
}

export function normalizeOpenGameArtItem(
  raw: OpenGameArtRawItem,
  sourceKey: string,
): Asset {
  const license = normalizeLicense(raw.licenseText || "CC-BY");
  const categoryLower = raw.category.toLowerCase();
  let type: AssetType = "image";
  if (categoryLower.includes("3d") || categoryLower.includes("model")) {
    type = "model";
  } else if (
    categoryLower.includes("audio") ||
    categoryLower.includes("music")
  ) {
    type = "audio";
  } else if (categoryLower.includes("tileset")) {
    type = "texture";
  }

  return {
    id: raw.name.toLowerCase().replace(/\s+/g, "-"),
    sourceKey,
    name: raw.name,
    type,
    license,
    downloadUrl: raw.link || `https://opengameart.org`,
    thumbnailUrl: raw.thumbnail,
    tags: [raw.category.toLowerCase()],
    metadata: { category: raw.category },
    discoveredAt: new Date(),
  };
}

export class OpenGameArtAdapter implements AssetSourceGateway {
  readonly sourceKey = "opengameart";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://opengameart.org/art-search-advanced") {
    this.baseUrl = baseUrl;
  }

  async listAssets(type?: AssetType): Promise<Asset[]> {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(SELECTORS.assetRow);
        const html = await page.content();
        const rawItems = parseOpenGameArtHtml(html);
        const assets = rawItems.map((item) =>
          normalizeOpenGameArtItem(item, this.sourceKey),
        );
        return type ? assets.filter((a) => a.type === type) : assets;
      } finally {
        await browser.close();
      }
    } catch (err) {
      console.warn(
        `[opengameart] Scraping failed: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }

  async getAsset(id: string): Promise<Asset | null> {
    return null;
  }
}
