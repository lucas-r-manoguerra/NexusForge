import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { normalizeLicense } from "@lib/adapters/shared/license-map";

const SELECTORS = {
  assetCard: ".pack-card",
  name: ".pack-title",
  thumbnail: ".pack-thumbnail img",
  link: ".pack-card a",
} as const;

interface QuaterniusRawItem {
  name: string;
  thumbnail: string;
  link: string;
}

/**
 * Parse Quaternius HTML into raw structured items.
 * All Quaternius assets are packs — always type "pack".
 */
export function parseQuaterniusHtml(html: string): QuaterniusRawItem[] {
  if (typeof document === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const cards = doc.querySelectorAll(SELECTORS.assetCard);

  return Array.from(cards).map((card) => ({
    name: card.querySelector(SELECTORS.name)?.textContent?.trim() ?? "",
    thumbnail:
      card.querySelector<HTMLImageElement>(SELECTORS.thumbnail)?.src ?? "",
    link:
      (card.querySelector<HTMLAnchorElement>(SELECTORS.link)?.href as string) ??
      "",
  }));
}

export function normalizeQuaterniusItem(
  raw: QuaterniusRawItem,
  sourceKey: string,
): Asset {
  return {
    id: raw.name.toLowerCase().replace(/\s+/g, "-"),
    sourceKey,
    name: raw.name,
    type: "pack",
    license: normalizeLicense("CC0"),
    downloadUrl: raw.link || `https://quaternius.com`,
    thumbnailUrl: raw.thumbnail,
    tags: ["free", "pack"],
    metadata: {},
    discoveredAt: new Date(),
  };
}

export class QuaterniusAdapter implements AssetSourceGateway {
  readonly sourceKey = "quaternius";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://quaternius.com/packs.html") {
    this.baseUrl = baseUrl;
  }

  async listAssets(type?: AssetType): Promise<Asset[]> {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(SELECTORS.assetCard);
        const html = await page.content();
        const rawItems = parseQuaterniusHtml(html);
        const assets = rawItems.map((item) =>
          normalizeQuaterniusItem(item, this.sourceKey),
        );
        return type ? assets.filter((a) => a.type === type) : assets;
      } finally {
        await browser.close();
      }
    } catch (err) {
      console.warn(
        `[quaternius] Scraping failed: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }

  async getAsset(id: string): Promise<Asset | null> {
    return null;
  }
}
