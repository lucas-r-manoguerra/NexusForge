import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { normalizeLicense } from "@lib/adapters/shared/license-map";
import { mapCategoryToAssetType } from "@lib/adapters/shared/type-map";

const SELECTORS = {
  assetCard: ".asset-card",
  name: ".asset-title",
  thumbnail: ".asset-thumbnail img",
  category: ".asset-category",
  link: ".asset-card a",
} as const;

interface KenneyRawItem {
  name: string;
  thumbnail: string;
  category: string;
  link: string;
}

/**
 * Parse Kenney HTML into raw structured items.
 * Exported for testability with jsdom fixtures.
 */
export function parseKenneyHtml(html: string): KenneyRawItem[] {
  if (typeof document === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const cards = doc.querySelectorAll(SELECTORS.assetCard);

  return Array.from(cards).map((card) => ({
    name: card.querySelector(SELECTORS.name)?.textContent?.trim() ?? "",
    thumbnail:
      card.querySelector<HTMLImageElement>(SELECTORS.thumbnail)?.src ?? "",
    category:
      card.querySelector(SELECTORS.category)?.textContent?.trim() ?? "",
    link:
      (card.querySelector<HTMLAnchorElement>(SELECTORS.link)?.href as string) ??
      "",
  }));
}

export function normalizeKenneyItem(
  raw: KenneyRawItem,
  sourceKey: string,
): Asset {
  const type = mapCategoryToAssetType(raw.category, sourceKey);
  return {
    id: raw.name.toLowerCase().replace(/\s+/g, "-"),
    sourceKey,
    name: raw.name,
    type,
    license: normalizeLicense("CC0"),
    downloadUrl: raw.link || `https://kenney.nl/assets`,
    thumbnailUrl: raw.thumbnail,
    tags: [raw.category.toLowerCase()],
    metadata: { category: raw.category },
    discoveredAt: new Date(),
  };
}

export class KenneyAdapter implements AssetSourceGateway {
  readonly sourceKey = "kenney";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://kenney.nl/assets") {
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
        const rawItems = await page.evaluate((sels) => {
          const cards = document.querySelectorAll(sels.assetCard);
          return Array.from(cards).map((card) => ({
            name: card.querySelector(sels.name)?.textContent?.trim() ?? "",
            thumbnail:
              (card.querySelector(sels.thumbnail) as HTMLImageElement)?.src ??
              "",
            category:
              card.querySelector(sels.category)?.textContent?.trim() ?? "",
            link:
              (card.querySelector(sels.link) as HTMLAnchorElement)?.href ?? "",
          }));
        }, SELECTORS);
        const assets = rawItems.map((item) =>
          normalizeKenneyItem(item, this.sourceKey),
        );
        return type ? assets.filter((a) => a.type === type) : assets;
      } finally {
        await browser.close();
      }
    } catch (err) {
      console.warn(
        `[kenney] Scraping failed: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }

  async getAsset(id: string): Promise<Asset | null> {
    return null;
  }
}
