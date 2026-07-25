import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseKenneyHtml,
  normalizeKenneyItem,
} from "@lib/adapters/scraping/kenney.adapter";
import {
  parseOpenGameArtHtml,
  normalizeOpenGameArtItem,
} from "@lib/adapters/scraping/opengameart.adapter";
import {
  parseQuaterniusHtml,
  normalizeQuaterniusItem,
} from "@lib/adapters/scraping/quaternius.adapter";
import {
  parsePolyPizzaHtml,
  normalizePolyPizzaItem,
} from "@lib/adapters/scraping/poly-pizza.adapter";

import kenneyHtml from "../../../fixtures/html/kenney.html?raw";
import opengameartHtml from "../../../fixtures/html/opengameart.html?raw";
import quaterniusHtml from "../../../fixtures/html/quaternius.html?raw";
import polyPizzaHtml from "../../../fixtures/html/poly-pizza.html?raw";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("KenneyAdapter — fixture parsing", () => {
  it("parses kenney HTML fixture into raw items", () => {
    const items = parseKenneyHtml(kenneyHtml);
    expect(items).toHaveLength(4);
    expect(items[0].name).toBe("Polygon Kit");
    expect(items[0].category).toBe("3D");
    expect(items[2].name).toBe("Interface Sounds");
    expect(items[2].category).toBe("Audio");
  });

  it("normalizes raw items to Asset objects", () => {
    const items = parseKenneyHtml(kenneyHtml);
    const assets = items.map((item) => normalizeKenneyItem(item, "kenney"));

    expect(assets).toHaveLength(4);
    expect(assets[0].sourceKey).toBe("kenney");
    expect(assets[0].type).toBe("model");
    expect(assets[0].license.spdxId).toBe("CC0-1.0");
    expect(assets[0].tags).toContain("3d");

    expect(assets[2].type).toBe("audio");
    expect(assets[2].tags).toContain("audio");
  });

  it("maps UI category to image type", () => {
    const items = parseKenneyHtml(kenneyHtml);
    const assets = items.map((item) => normalizeKenneyItem(item, "kenney"));
    expect(assets[3].type).toBe("image");
  });

  it("returns empty array for invalid HTML", () => {
    expect(parseKenneyHtml("<html><body></body></html>")).toEqual([]);
  });
});

describe("OpenGameArtAdapter — fixture parsing", () => {
  it("parses opengameart HTML fixture into raw items", () => {
    const items = parseOpenGameArtHtml(opengameartHtml);
    expect(items).toHaveLength(3);
    expect(items[0].name).toBe("Fantasy Character Set");
    expect(items[0].licenseText).toBe("CC-BY 4.0");
    expect(items[2].licenseText).toBe("CC-BY-SA 4.0");
  });

  it("normalizes raw items to Asset objects with license", () => {
    const items = parseOpenGameArtHtml(opengameartHtml);
    const assets = items.map((item) =>
      normalizeOpenGameArtItem(item, "opengameart"),
    );

    expect(assets).toHaveLength(3);
    expect(assets[0].sourceKey).toBe("opengameart");
    expect(assets[0].license.attribution).toBe(true);
    expect(assets[0].license.commercial).toBe(true);

    expect(assets[1].license.spdxId).toBe("CC0-1.0");
    expect(assets[1].type).toBe("texture");
  });

  it("maps audio category to audio type", () => {
    const items = parseOpenGameArtHtml(opengameartHtml);
    const assets = items.map((item) =>
      normalizeOpenGameArtItem(item, "opengameart"),
    );
    expect(assets[2].type).toBe("audio");
  });

  it("returns empty array for invalid HTML", () => {
    expect(parseOpenGameArtHtml("<html></html>")).toEqual([]);
  });
});

describe("QuaterniusAdapter — fixture parsing", () => {
  it("parses quaternius HTML fixture into raw items", () => {
    const items = parseQuaterniusHtml(quaterniusHtml);
    expect(items).toHaveLength(3);
    expect(items[0].name).toBe("Ultimate Animated Character");
    expect(items[1].name).toBe("Low Poly Character");
  });

  it("normalizes all items to type 'pack'", () => {
    const items = parseQuaterniusHtml(quaterniusHtml);
    const assets = items.map((item) =>
      normalizeQuaterniusItem(item, "quaternius"),
    );

    expect(assets).toHaveLength(3);
    for (const asset of assets) {
      expect(asset.type).toBe("pack");
      expect(asset.license.spdxId).toBe("CC0-1.0");
      expect(asset.sourceKey).toBe("quaternius");
    }
  });

  it("returns empty array for invalid HTML", () => {
    expect(parseQuaterniusHtml("<html></html>")).toEqual([]);
  });
});

describe("PolyPizzaAdapter — fixture parsing", () => {
  it("parses poly pizza HTML fixture into raw items", () => {
    const items = parsePolyPizzaHtml(polyPizzaHtml);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Fantasy Character 01");
    expect(items[1].name).toBe("Cartoon Car");
  });

  it("normalizes all items to type 'model'", () => {
    const items = parsePolyPizzaHtml(polyPizzaHtml);
    const assets = items.map((item) =>
      normalizePolyPizzaItem(item, "polypizza"),
    );

    expect(assets).toHaveLength(2);
    for (const asset of assets) {
      expect(asset.type).toBe("model");
      expect(asset.license.spdxId).toBe("CC0-1.0");
      expect(asset.sourceKey).toBe("polypizza");
    }
  });

  it("returns empty array for invalid HTML", () => {
    expect(parsePolyPizzaHtml("<html></html>")).toEqual([]);
  });
});

describe("Graceful degradation", () => {
  it("all parsers handle empty HTML", () => {
    expect(parseKenneyHtml("")).toEqual([]);
    expect(parseOpenGameArtHtml("")).toEqual([]);
    expect(parseQuaterniusHtml("")).toEqual([]);
    expect(parsePolyPizzaHtml("")).toEqual([]);
  });
});
