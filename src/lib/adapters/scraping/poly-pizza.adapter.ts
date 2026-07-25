import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { normalizeLicense } from "@lib/adapters/shared/license-map";

const SELECTORS = {
  assetCard: ".model-card",
  name: ".model-name",
  thumbnail: ".model-thumbnail img",
  link: ".model-card a",
} as const;

interface PolyPizzaRawItem {
  name: string;
  thumbnail: string;
  link: string;
}

/**
 * Parse Poly Pizza HTML into raw structured items.
 * All Poly Pizza assets are 3D models — always type "model".
 */
export function parsePolyPizzaHtml(html: string): PolyPizzaRawItem[] {
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

export function normalizePolyPizzaItem(
  raw: PolyPizzaRawItem,
  sourceKey: string,
): Asset {
  return {
    id: raw.name.toLowerCase().replace(/\s+/g, "-"),
    sourceKey,
    name: raw.name,
    type: "model",
    license: normalizeLicense("CC0"),
    downloadUrl: raw.link || `https://poly.pizza`,
    thumbnailUrl: raw.thumbnail,
    tags: ["3d", "free"],
    metadata: {},
    discoveredAt: new Date(),
  };
}

export class PolyPizzaAdapter implements AssetSourceGateway {
  readonly sourceKey = "polypizza";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://poly.pizza/browse") {
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
        const rawItems = parsePolyPizzaHtml(html);
        const assets = rawItems.map((item) =>
          normalizePolyPizzaItem(item, this.sourceKey),
        );
        return type ? assets.filter((a) => a.type === type) : assets;
      } finally {
        await browser.close();
      }
    } catch (err) {
      console.warn(
        `[polypizza] Scraping failed: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }

  async getAsset(id: string): Promise<Asset | null> {
    return null;
  }
}
