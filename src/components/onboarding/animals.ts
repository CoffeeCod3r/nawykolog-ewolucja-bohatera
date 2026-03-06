// local images for each animal stage; only imported for the first seven animals
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

export interface AnimalDef {
  type: string;
  emoji: string;
  name: string;
  passive: string;
  passiveDesc: string;
  stages: string[];
  /** optional imported images corresponding to each stage */
  images?: string[];
}

export const ANIMALS: AnimalDef[] = [
  {
    type: "wolf",
    emoji: "🐺",
    name: "Wilk",
    passive: "Wataha",
    passiveDesc: "+5% monet za aktywnych znajomych",
    stages: ["🐺", "🐺", "🐺", "🐺"],
    images: [wolf1, wolf2, wolf3, wolf4],
  },
  {
    type: "eagle",
    emoji: "🦅",
    name: "Orzeł",
    passive: "Wzrok",
    passiveDesc: "Widzi pozycje rywali w czasie rzeczywistym",
    stages: ["🦅", "🦅", "🦅", "🦅"],
    images: [eagle1, eagle2, eagle3, eagle4],
  },
  {
    type: "bear",
    emoji: "🐻",
    name: "Niedźwiedź",
    passive: "Hibernacja",
    passiveDesc: "Raz w miesiącu 2 dni bez utraty streaka",
    stages: ["🐻", "🐻", "🐻", "🐻"],
    images: [bear1, bear2, bear3, bear4],
  },
  {
    type: "fox",
    emoji: "🦊",
    name: "Lis",
    passive: "Spryt",
    passiveDesc: "Kradnie 10 monet od wyższego gracza raz w tygodniu",
    stages: ["🦊", "🦊", "🦊", "🦊"],
    images: [fox1, fox2, fox3, fox4],
  },
  {
    type: "tiger",
    emoji: "🐯",
    name: "Tygrys",
    passive: "Polowanie",
    passiveDesc: "x2 monety za kompletny dzień",
    stages: ["🐯", "🐯", "🐯", "🐯"],
    images: [tiger1, tiger2, tiger3, tiger4],
  },
  {
    type: "dolphin",
    emoji: "🐬",
    name: "Delfin",
    passive: "Ekolokacja",
    passiveDesc: "Powiadomienie gdy rywal zbliża się w rankingu",
    stages: ["🐬", "🐬", "🐬", "🐬"],
    images: [dolphin1, dolphin2, dolphin3, dolphin4],
  },
  {
    type: "owl",
    emoji: "🦉",
    name: "Sowa",
    passive: "Noc",
    passiveDesc: "x1.5 monet za nawyki po 21:00",
    stages: ["🦉", "🦉", "🦉", "🦉"],
    images: [owl1, owl2, owl3, owl4],
  },
  {
    type: "dragon",
    emoji: "🐉",
    name: "Smok",
    passive: "Ogień",
    passiveDesc: "x2 EXP przez 3 dni po 7-dniowej serii",
    stages: ["🐉", "🐉", "🐉", "🐉"],
    images: [dragon1, dragon2, dragon3, dragon4],
  },
  {
    type: "panther",
    emoji: "🐆",
    name: "Pantera",
    passive: "Cień",
    passiveDesc: "Pozycja ukryta dla rywali przez 5 dni turnieju",
    stages: ["🐆", "🐆", "🐆", "🐆"],
    images: [panther1, panther2, panther3, panther4],
  },
  {
    type: "turtle",
    emoji: "🐢",
    name: "Żółw",
    passive: "Wytrwałość",
    passiveDesc: "Maksymalna utrata 20 monet dziennie",
    stages: ["🐢", "🐢", "🐢", "🐢"],
    images: [turtle1, turtle2, turtle3, turtle4],
  },
];

export const PROVINCES = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
];

export const HABIT_TEMPLATES = [
  { name: "Poranna aktywność fizyczna", emoji: "🏃" },
  { name: "Czytanie 15 minut", emoji: "📖" },
  { name: "Picie 2 litrów wody", emoji: "💧" },
  { name: "Medytacja", emoji: "🧘" },
  { name: "Nauka języka", emoji: "🗣️" },
  { name: "Zdrowe śniadanie", emoji: "🥗" },
  { name: "Sen przed 23:00", emoji: "😴" },
  { name: "Brak telefonu godzinę przed snem", emoji: "📵" },
];
