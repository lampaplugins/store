import raw from "../data/extensions.json";

export const CANONICAL_HOST = "lampaplugins.github.io";
export const STORE_JS = `https://${CANONICAL_HOST}/store/store.js`;
export const GITHUB = "https://github.com/lampaplugins/store";

export interface Plugin {
  name: string;
  author: string;
  link: string;
  descr: string;
  version?: string;
  available_lampa?: number;
  local: boolean;
  path: string | null;
}

export interface Section {
  title: string;
  hpu: string;
  plugins: Plugin[];
}

interface RawPlugin {
  name?: string;
  author?: string;
  link?: string;
  descr?: string;
  version?: string;
  available_lampa?: number;
}

interface RawSection {
  title?: string;
  hpu?: string;
  results?: RawPlugin[];
}

interface RawCatalog {
  results?: RawSection[];
}

function extractStorePath(link: string): string | null {
  try {
    const match = new URL(link).pathname.match(/\/store\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function isLocalPlugin(link: string): boolean {
  try {
    const url = new URL(link);
    if (!extractStorePath(link)) return false;
    return url.hostname === CANONICAL_HOST && url.pathname.startsWith("/store/");
  } catch {
    return false;
  }
}

export function loadCatalog(): Section[] {
  const data = raw as RawCatalog;
  return (data.results ?? []).map((section) => ({
    title: section.title || "Разное",
    hpu: section.hpu || "other",
    plugins: (section.results ?? [])
      .filter((item): item is RawPlugin & { link: string } => Boolean(item.link))
      .map((item) => ({
        name: item.name || item.link,
        author: item.author || "",
        link: item.link,
        descr: item.descr || "",
        version: item.version,
        available_lampa: item.available_lampa,
        local: isLocalPlugin(item.link),
        path: extractStorePath(item.link),
      })),
  }));
}

export function countPlugins(sections: Section[]): number {
  return sections.reduce((n, s) => n + s.plugins.length, 0);
}
