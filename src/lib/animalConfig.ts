// Animal type mappings - Polish to English and display names

// local image imports (used when supabaseUrl is not available)
import wolf1 from "@/assets/wilk_ewolucja_1.jpg";
import wolf2 from "@/assets/wilk_ewolucja_2.jpg";
import wolf3 from "@/assets/wilk_ewolucja_3.jpg";
import wolf4 from "@/assets/wilk_ewolucja_4.jpg";
import eagle1 from "@/assets/orzel_ewolucja_1.jpg";
import eagle2 from "@/assets/orzel_ewolucja_2.jpg";
import eagle3 from "@/assets/orzel_ewolucja_3.jpg";
import eagle4 from "@/assets/orzel_ewolucja_4.jpg";
import bear1 from "@/assets/niedzwiedz_ewolucja1.jpg";
import bear2 from "@/assets/niedzwiedz_ewolucja2.jpg";
import bear3 from "@/assets/niedzwiedz_ewolucja3.jpg";
import bear4 from "@/assets/niedzwiedz_ewolucja4.jpg";
import fox1 from "@/assets/lis_ewolucja_1.jpg";
import fox2 from "@/assets/lis_ewolucja_2.jpg";
import fox3 from "@/assets/lis_ewolucja_3.jpg";
import fox4 from "@/assets/lis_ewolucja_4.jpg";
import tiger1 from "@/assets/tygrys_ewolucja_1.jpg";
import tiger2 from "@/assets/tygrys_ewolucja_2.jpg";
import tiger3 from "@/assets/tygrys_ewolucja_3.jpg";
import tiger4 from "@/assets/tygrys_ewolucja_4.jpg";
import dolphin1 from "@/assets/delfin_ewolucja_1.jpg";
import dolphin2 from "@/assets/delfin_ewolucja_2.jpg";
import dolphin3 from "@/assets/delfin_ewolucja_3.jpg";
import dolphin4 from "@/assets/delfin_ewolucja_4.jpg";
import owl1 from "@/assets/sowa_ewolucja_1.jpg";
import owl2 from "@/assets/sowa_ewolucja_2.jpg";
import owl3 from "@/assets/sowa_ewolucja_3.jpg";
import owl4 from "@/assets/sowa_ewolucja_4.jpg";
import dragon1 from "@/assets/smok_ewolucja_1.jpg";
import dragon2 from "@/assets/smok_ewolucja_2.jpg";
import dragon3 from "@/assets/smok_ewolucja_3.jpg";
import dragon4 from "@/assets/smok_ewolucja_4.jpg";
import panther1 from "@/assets/pantera_ewolucja_1.jpg";
import panther2 from "@/assets/pantera_ewolucja_2.jpg";
import panther3 from "@/assets/pantera_ewolucja_3.jpg";
import panther4 from "@/assets/pantera_ewolucja_4.jpg";
import turtle1 from "@/assets/zolw_ewolucja1.jpg";
import turtle2 from "@/assets/zolw_ewolucja2.jpg";
import turtle3 from "@/assets/zolw_ewolucja3.jpg";
import turtle4 from "@/assets/zolw_ewolucja4.jpg";

export const ANIMAL_TYPES = {
  wolf: { en: "wolf", pl: "wilk" },
  eagle: { en: "orzel", pl: "orzeł" },
  bear: { en: "niedzwiedz", pl: "niedźwiedź" },
  fox: { en: "lis", pl: "lis" },
  tiger: { en: "tygrys", pl: "tygrys" },
  dolphin: { en: "delfin", pl: "delfin" },
  owl: { en: "sowa", pl: "sowa" },
  dragon: { en: "smok", pl: "smok" }, // May need adjustment
  panther: { en: "pantera", pl: "pantera" }, // May need adjustment
  turtle: { en: "zolw", pl: "żółw" }, // May need adjustment
} as const;

export type AnimalType = keyof typeof ANIMAL_TYPES;

export const STAGE_COLORS = {
  1: { glow: "gray", primary: "from-gray-400 to-gray-600" },
  2: { glow: "blue", primary: "from-blue-400 to-blue-600" },
  3: { glow: "purple", primary: "from-purple-400 to-purple-600" },
  4: { glow: "gold", primary: "from-amber-400 to-amber-600" },
} as const;

export const GLOW_BOX_SHADOWS = {
  1: "0 0 20px rgba(156, 163, 175, 0.5)",
  2: "0 0 20px rgba(96, 165, 250, 0.5)",
  3: "0 0 20px rgba(168, 85, 247, 0.5)",
  4: "0 0 20px rgba(251, 191, 36, 0.5)",
} as const;

export const SIZE_PIXELS = {
  xs: 32,
  sm: 48,
  md: 80,
  lg: 128,
  xl: 200,
  hero: 320,
} as const;

export type AnimalSize = keyof typeof SIZE_PIXELS;

export type AnimationType = "idle" | "evolve" | "victory" | "none";

// Get animal display name
export function getAnimalName(animal: AnimalType): string {
  return ANIMAL_TYPES[animal]?.pl || animal;
}

// Get animal initial
export function getAnimalInitial(animal: AnimalType): string {
  const name = getAnimalName(animal);
  return name.charAt(0).toUpperCase();
}

// Get Supabase Storage URL for animal image
// note: when supabaseUrl is falsy we fallback to local asset imports
export function getAnimalImageUrl(
  animal: AnimalType,
  stage: 1 | 2 | 3 | 4,
  supabaseUrl?: string,
): string {
  const animalKey = ANIMAL_TYPES[animal]?.en || animal;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/animals/${animalKey}_ewolucja_${stage}.jpg`;
  }
  // local fallback: only first seven animals currently have assets
  const localMap: Partial<Record<AnimalType, string[]>> = {
    wolf: [wolf1, wolf2, wolf3, wolf4],
    eagle: [eagle1, eagle2, eagle3, eagle4],
    bear: [bear1, bear2, bear3, bear4],
    fox: [fox1, fox2, fox3, fox4],
    tiger: [tiger1, tiger2, tiger3, tiger4],
    dolphin: [dolphin1, dolphin2, dolphin3, dolphin4],
    owl: [owl1, owl2, owl3, owl4],
  };
  const arr = localMap[animal];
  if (arr) {
    return arr[stage - 1] || "";
  }
  return "";
}
