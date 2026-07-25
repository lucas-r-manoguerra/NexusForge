export type AdapterType = "api" | "scraping";

export interface AssetSource {
  key: string;
  name: string;
  baseUrl: string;
  adapterType: AdapterType;
}
