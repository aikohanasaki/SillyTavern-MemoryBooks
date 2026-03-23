const DEFAULT_MIN_CHILDREN = 5;

export const STMB_SUMMARY_TIERS = [
  { tier: 0, key: "memory", label: "Memory" },
  { tier: 1, key: "arc", label: "Arc" },
  { tier: 2, key: "chapter", label: "Chapter" },
  { tier: 3, key: "book", label: "Book" },
  { tier: 4, key: "legend", label: "Legend" },
  { tier: 5, key: "series", label: "Series" },
  { tier: 6, key: "epic", label: "Epic" },
];

const TIER_MAP = new Map(STMB_SUMMARY_TIERS.map((cfg) => [cfg.tier, cfg]));

function normalizeTier(tier) {
  const num = Number(tier);
  return Number.isFinite(num) ? Math.trunc(num) : 0;
}

export function getSummaryTierConfig(tier) {
  const normalizedTier = normalizeTier(tier);
  if (TIER_MAP.has(normalizedTier)) {
    return TIER_MAP.get(normalizedTier);
  }
  return {
    tier: normalizedTier,
    key: `tier${normalizedTier}`,
    label: `Tier ${normalizedTier}`,
  };
}

export function getSummaryTierLabel(tier) {
  return getSummaryTierConfig(tier).label;
}

export function getSummaryTypeKey(tier) {
  return getSummaryTierConfig(tier).key;
}

export function getSourceTierForTarget(targetTier) {
  return Math.max(0, normalizeTier(targetTier) - 1);
}

export function getDefaultSummaryTitleFormat(tier) {
  const cfg = getSummaryTierConfig(tier);
  if (cfg.tier <= 0) return "[000] - {{title}}";
  return `[${String(cfg.key || "tier").toUpperCase()} 000] - {{title}}`;
}

export function getDefaultSummaryMinChildren(tier) {
  return normalizeTier(tier) <= 0 ? 0 : DEFAULT_MIN_CHILDREN;
}

export function isSummaryEntry(entry) {
  return !!entry && entry.stmbSummary === true;
}

export function getEntrySummaryTier(entry) {
  if (!entry || typeof entry !== "object") return 0;
  if (entry.stmbSummary === true) {
    const tier = normalizeTier(entry.stmbSummaryTier);
    return tier > 0 ? tier : 1;
  }
  if (entry.stmbArc === true || String(entry.type || "").toLowerCase() === "arc") {
    return 1;
  }
  return 0;
}

export function isEligibleSummarySourceEntry(entry, sourceTier) {
  if (!entry || typeof entry !== "object") return false;
  if (entry.stmemorybooks !== true) return false;
  if (entry.disable) return false;
  return getEntrySummaryTier(entry) === normalizeTier(sourceTier);
}

export function migrateLorebookSummarySchema(lorebookData) {
  const entries = Object.values(lorebookData?.entries || {});
  let changed = false;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;

    const isLegacyArc =
      entry.stmbArc === true || String(entry.type || "").toLowerCase() === "arc";
    if (isLegacyArc) {
      if (entry.stmbSummary !== true) {
        entry.stmbSummary = true;
        changed = true;
      }
      if (normalizeTier(entry.stmbSummaryTier) !== 1) {
        entry.stmbSummaryTier = 1;
        changed = true;
      }
      if (entry.type !== "arc") {
        entry.type = "arc";
        changed = true;
      }
    }

    if (entry.disabledByArcId !== undefined && entry.disabledBySummaryId === undefined) {
      entry.disabledBySummaryId = entry.disabledByArcId ?? null;
      changed = true;
    }

    if ("stmbArc" in entry) {
      delete entry.stmbArc;
      changed = true;
    }
    if ("disabledByArcId" in entry) {
      delete entry.disabledByArcId;
      changed = true;
    }
  }
  return changed;
}
