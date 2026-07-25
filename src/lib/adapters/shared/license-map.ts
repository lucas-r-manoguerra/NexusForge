import type { License } from "@lib/domain/models/license";

interface LicenseMapping {
  spdxId: string;
  name: string;
  commercial: boolean;
  attribution: boolean;
}

const LICENSE_MAP: Record<string, LicenseMapping> = {
  "cc0": {
    spdxId: "CC0-1.0",
    name: "CC Zero 1.0",
    commercial: true,
    attribution: false,
  },
  "cc0-1.0": {
    spdxId: "CC0-1.0",
    name: "CC Zero 1.0",
    commercial: true,
    attribution: false,
  },
  "cc-zero": {
    spdxId: "CC0-1.0",
    name: "CC Zero 1.0",
    commercial: true,
    attribution: false,
  },
  "cc-by-4.0": {
    spdxId: "CC-BY-4.0",
    name: "Creative Commons Attribution 4.0",
    commercial: true,
    attribution: true,
  },
  "cc-by 4.0": {
    spdxId: "CC-BY-4.0",
    name: "Creative Commons Attribution 4.0",
    commercial: true,
    attribution: true,
  },
  "cc-by": {
    spdxId: "CC-BY-4.0",
    name: "Creative Commons Attribution 4.0",
    commercial: true,
    attribution: true,
  },
  "cc-by-3.0": {
    spdxId: "CC-BY-3.0",
    name: "Creative Commons Attribution 3.0",
    commercial: true,
    attribution: true,
  },
  "cc-by-sa-4.0": {
    spdxId: "CC-BY-SA-4.0",
    name: "Creative Commons Attribution-ShareAlike 4.0",
    commercial: true,
    attribution: true,
  },
  "cc-by-sa": {
    spdxId: "CC-BY-SA-4.0",
    name: "Creative Commons Attribution-ShareAlike 4.0",
    commercial: true,
    attribution: true,
  },
  "cc-by-nc-4.0": {
    spdxId: "CC-BY-NC-4.0",
    name: "Creative Commons Attribution-NonCommercial 4.0",
    commercial: false,
    attribution: true,
  },
  "cc-by-nc": {
    spdxId: "CC-BY-NC-4.0",
    name: "Creative Commons Attribution-NonCommercial 4.0",
    commercial: false,
    attribution: true,
  },
  "gpl-3.0": {
    spdxId: "GPL-3.0-only",
    name: "GNU General Public License v3.0",
    commercial: false,
    attribution: false,
  },
  "mit": {
    spdxId: "MIT",
    name: "MIT License",
    commercial: true,
    attribution: false,
  },
  "unlicense": {
    spdxId: "Unlicense",
    name: "The Unlicense",
    commercial: true,
    attribution: false,
  },
  "public domain": {
    spdxId: "CC0-1.0",
    name: "CC Zero 1.0",
    commercial: true,
    attribution: false,
  },
};

/**
 * Normalize a raw license string into a structured License value object.
 * Case-insensitive lookup against known SPDX mappings.
 * Falls back to an unknown-license shape using the raw string.
 */
export function normalizeLicense(raw: string): License {
  const key = raw.trim().toLowerCase();
  const mapping = LICENSE_MAP[key];

  if (mapping) {
    return { ...mapping };
  }

  return {
    spdxId: raw,
    name: raw,
    commercial: false,
    attribution: false,
  };
}
