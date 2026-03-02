export interface AnimalDef {
  type: string;
  emoji: string;
  name: string;
  passive: string;
  passiveDesc: string;
  stages: string[];
}

export const ANIMALS: AnimalDef[] = [
  {
    type: "wolf",
    emoji: "🐺",
    name: "Wilk",
    passive: "Wataha",
    passiveDesc: "+5% monet za aktywnych znajomych",
    stages: ["🐺", "🐺", "🐺", "🐺"],
  },
  {
    type: "eagle",
    emoji: "🦅",
    name: "Orzeł",
    passive: "Wzrok",
    passiveDesc: "Widzi pozycje rywali w czasie rzeczywistym",
    stages: ["🦅", "🦅", "🦅", "🦅"],
  },
  {
    type: "bear",
    emoji: "🐻",
    name: "Niedźwiedź",
    passive: "Hibernacja",
    passiveDesc: "Raz w miesiącu 2 dni bez utraty streaka",
    stages: ["🐻", "🐻", "🐻", "🐻"],
  },
  {
    type: "fox",
    emoji: "🦊",
    name: "Lis",
    passive: "Spryt",
    passiveDesc: "Kradnie 10 monet od wyższego gracza raz w tygodniu",
    stages: ["🦊", "🦊", "🦊", "🦊"],
  },
  {
    type: "tiger",
    emoji: "🐯",
    name: "Tygrys",
    passive: "Polowanie",
    passiveDesc: "x2 monety za kompletny dzień",
    stages: ["🐯", "🐯", "🐯", "🐯"],
  },
  {
    type: "dolphin",
    emoji: "🐬",
    name: "Delfin",
    passive: "Ekolokacja",
    passiveDesc: "Powiadomienie gdy rywal zbliża się w rankingu",
    stages: ["🐬", "🐬", "🐬", "🐬"],
  },
  {
    type: "owl",
    emoji: "🦉",
    name: "Sowa",
    passive: "Noc",
    passiveDesc: "x1.5 monet za nawyki po 21:00",
    stages: ["🦉", "🦉", "🦉", "🦉"],
  },
  {
    type: "dragon",
    emoji: "🐉",
    name: "Smok",
    passive: "Ogień",
    passiveDesc: "x2 EXP przez 3 dni po 7-dniowej serii",
    stages: ["🐉", "🐉", "🐉", "🐉"],
  },
  {
    type: "panther",
    emoji: "🐆",
    name: "Pantera",
    passive: "Cień",
    passiveDesc: "Pozycja ukryta dla rywali przez 5 dni turnieju",
    stages: ["🐆", "🐆", "🐆", "🐆"],
  },
  {
    type: "turtle",
    emoji: "🐢",
    name: "Żółw",
    passive: "Wytrwałość",
    passiveDesc: "Maksymalna utrata 20 monet dziennie",
    stages: ["🐢", "🐢", "🐢", "🐢"],
  },
];

export const PROVINCES = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie",
  "łódzkie", "małopolskie", "mazowieckie", "opolskie",
  "podkarpackie", "podlaskie", "pomorskie", "śląskie",
  "świętokrzyskie", "warmińsko-mazurskie", "wielkopolskie", "zachodniopomorskie",
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
