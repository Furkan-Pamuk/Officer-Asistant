import type { Dish, MenuMeal } from "./types";

// Kcal values are rough per-portion estimates for planning, not medical advice.
export const DISHES: Dish[] = [
  // Breakfast
  { id: "b-menemen", name: "Menemen", kcal: 320, meal: "breakfast", tags: ["egg"], cuisine: "turkish", custom: false },
  { id: "b-omlet", name: "Omlet (sade)", kcal: 250, meal: "breakfast", tags: ["egg"], cuisine: "turkish", custom: false },
  { id: "b-sucuk", name: "Sucuklu yumurta", kcal: 450, meal: "breakfast", tags: ["egg", "meat"], cuisine: "turkish", custom: false },
  { id: "b-peynir", name: "Peynir tabağı", kcal: 300, meal: "breakfast", tags: ["dairy"], cuisine: "turkish", custom: false },
  { id: "b-kahvalti", name: "Serpme kahvaltı (zeytin, domates, salatalık)", kcal: 350, meal: "breakfast", tags: ["light"], cuisine: "turkish", custom: false },
  { id: "b-bal", name: "Bal + kaymak", kcal: 400, meal: "breakfast", tags: ["sweet"], cuisine: "turkish", custom: false },
  { id: "b-krep", name: "Krep", kcal: 350, meal: "breakfast", tags: ["pastry"], cuisine: "turkish", custom: false },
  { id: "b-tost", name: "Kaşarlı tost", kcal: 420, meal: "breakfast", tags: ["pastry", "dairy"], cuisine: "turkish", custom: false },
  { id: "b-yulaf", name: "Yulaf lapası + süt", kcal: 280, meal: "breakfast", tags: ["light", "cereal"], cuisine: "turkish", custom: false },
  { id: "b-simit", name: "Simit + peynir", kcal: 450, meal: "breakfast", tags: ["pastry"], cuisine: "turkish", custom: false },
  { id: "b-hasyumurta", name: "Haşlanmış yumurta (2 adet)", kcal: 160, meal: "breakfast", tags: ["egg", "light"], cuisine: "turkish", custom: false },
  { id: "b-borek", name: "Su böreği", kcal: 450, meal: "breakfast", tags: ["pastry"], cuisine: "turkish", custom: false },
  // Soups (lunch)
  { id: "s-mercimek", name: "Mercimek çorbası", kcal: 180, meal: "lunch", tags: ["soup", "legume"], cuisine: "turkish", custom: false },
  { id: "s-ezo", name: "Ezogelin çorbası", kcal: 200, meal: "lunch", tags: ["soup", "legume"], cuisine: "turkish", custom: false },
  { id: "s-tarhana", name: "Tarhana çorbası", kcal: 220, meal: "lunch", tags: ["soup"], cuisine: "turkish", custom: false },
  { id: "s-yayla", name: "Yayla çorbası", kcal: 210, meal: "lunch", tags: ["soup", "dairy"], cuisine: "turkish", custom: false },
  { id: "s-domates", name: "Domates çorbası", kcal: 170, meal: "lunch", tags: ["soup", "vegetable"], cuisine: "turkish", custom: false },
  // Lunch mains — vegetable & legume heavy
  { id: "l-fasulye", name: "Kuru fasulye", kcal: 380, meal: "lunch", tags: ["legume"], cuisine: "turkish", custom: false },
  { id: "l-nohut", name: "Nohut yahnisi", kcal: 400, meal: "lunch", tags: ["legume"], cuisine: "turkish", custom: false },
  { id: "l-ispanak", name: "Ispanak yemeği", kcal: 250, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-pirasa", name: "Pırasa", kcal: 220, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-barbunya", name: "Barbunya pilaki", kcal: 350, meal: "lunch", tags: ["legume"], cuisine: "turkish", custom: false },
  { id: "l-turlu", name: "Türlü", kcal: 280, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-karnabahar", name: "Karnabahar", kcal: 240, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-musakka-k", name: "Kabak musakka", kcal: 300, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-bulgur", name: "Bulgur pilavı", kcal: 320, meal: "lunch", tags: ["cereal"], cuisine: "turkish", custom: false },
  { id: "l-sarma", name: "Zeytinyağlı yaprak sarma", kcal: 380, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-coban", name: "Çoban salata", kcal: 120, meal: "lunch", tags: ["salad"], cuisine: "turkish", custom: false },
  { id: "l-mevsim", name: "Mevsim salata", kcal: 100, meal: "lunch", tags: ["salad"], cuisine: "turkish", custom: false },
  // Dinner — red/white meat + pastry
  { id: "d-tavuksote", name: "Tavuk sote + pilav", kcal: 550, meal: "dinner", tags: ["white-meat"], cuisine: "turkish", custom: false },
  { id: "d-tavukizg", name: "Izgara tavuk", kcal: 380, meal: "dinner", tags: ["white-meat"], cuisine: "turkish", custom: false },
  { id: "d-etsote", name: "Et sote", kcal: 550, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-pide", name: "Kıymalı pide", kcal: 600, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "turkish", custom: false },
  { id: "d-lahmacun", name: "Lahmacun (2 adet)", kcal: 480, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "turkish", custom: false },
  { id: "d-manti", name: "Mantı", kcal: 550, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "turkish", custom: false },
  { id: "d-karniyarik", name: "Karnıyarık + pilav", kcal: 580, meal: "dinner", tags: ["red-meat", "vegetable"], cuisine: "turkish", custom: false },
  { id: "d-kofte", name: "Köfte + patates", kcal: 600, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-balik", name: "Balık ızgara + salata", kcal: 400, meal: "dinner", tags: ["white-meat", "fish"], cuisine: "turkish", custom: false },
  { id: "d-hamsi", name: "Hamsi tava", kcal: 450, meal: "dinner", tags: ["white-meat", "fish"], cuisine: "turkish", custom: false },
  { id: "d-guven", name: "Güveç", kcal: 520, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-pirzola", name: "Pirzola", kcal: 600, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-makarna", name: "Kıymalı makarna", kcal: 550, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "turkish", custom: false },
  { id: "d-sutlac", name: "Sütlaç", kcal: 300, meal: "dinner", tags: ["dessert", "dairy"], cuisine: "turkish", custom: false },
  { id: "d-baklava", name: "Baklava (3 dilim)", kcal: 450, meal: "dinner", tags: ["dessert"], cuisine: "turkish", custom: false },
  { id: "d-meyve", name: "Meyve tabağı", kcal: 120, meal: "dinner", tags: ["dessert", "light"], cuisine: "turkish", custom: false },
  { id: "b-pogaca", name: "Poğaça", kcal: 320, meal: "breakfast", tags: ["pastry"], cuisine: "turkish", custom: false },
  { id: "b-acma", name: "Açma", kcal: 380, meal: "breakfast", tags: ["pastry"], cuisine: "turkish", custom: false },
  { id: "b-muhlama", name: "Muhlama / mıhlama", kcal: 480, meal: "breakfast", tags: ["dairy"], cuisine: "turkish", custom: false },
  { id: "b-patates", name: "Patatesli yumurta", kcal: 380, meal: "breakfast", tags: ["egg"], cuisine: "turkish", custom: false },
  { id: "b-yogurt", name: "Yoğurt + granola + bal", kcal: 350, meal: "breakfast", tags: ["light", "dairy"], cuisine: "turkish", custom: false },
  { id: "b-sahanda", name: "Sahanda yumurta + sucuk", kcal: 500, meal: "breakfast", tags: ["egg", "meat"], cuisine: "turkish", custom: false },
  { id: "s-iskuembe", name: "İşkembe çorbası", kcal: 250, meal: "lunch", tags: ["soup"], cuisine: "turkish", custom: false },
  { id: "s-kelle", name: "Kelle paça", kcal: 280, meal: "lunch", tags: ["soup"], cuisine: "turkish", custom: false },
  { id: "s-sebze", name: "Sebze çorbası", kcal: 150, meal: "lunch", tags: ["soup", "vegetable"], cuisine: "turkish", custom: false },
  { id: "l-musakka", name: "Patlıcan musakka", kcal: 420, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-kereviz", name: "Zeytinyağlı kereviz", kcal: 260, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-enginar", name: "Zeytinyağlı enginar", kcal: 240, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-fasulye-p", name: "Taze fasulye", kcal: 230, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-bamya", name: "Bamya", kcal: 250, meal: "lunch", tags: ["vegetable"], cuisine: "turkish", custom: false },
  { id: "l-nohut-p", name: "Nohutlu pilav", kcal: 450, meal: "lunch", tags: ["legume", "cereal"], cuisine: "turkish", custom: false },
  { id: "l-makarna-s", name: "Sebzeli makarna", kcal: 420, meal: "lunch", tags: ["pastry"], cuisine: "turkish", custom: false },
  { id: "l-kisir", name: "Kısır + ayran", kcal: 380, meal: "lunch", tags: ["vegetable", "cereal"], cuisine: "turkish", custom: false },
  { id: "l-gavur", name: "Gavurdağı salata", kcal: 180, meal: "lunch", tags: ["salad"], cuisine: "turkish", custom: false },
  { id: "l-ton", name: "Ton balıklı salata", kcal: 280, meal: "lunch", tags: ["salad", "fish"], cuisine: "turkish", custom: false },
  { id: "d-hunkar", name: "Hünkar beğendi", kcal: 580, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-tas", name: "Tas kebabı + bulgur", kcal: 620, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-ciger", name: "Arnavut ciğeri", kcal: 480, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-tantuni", name: "Tantuni", kcal: 550, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-balik-t", name: "Balık tava + roka", kcal: 470, meal: "dinner", tags: ["white-meat", "fish"], cuisine: "turkish", custom: false },
  { id: "d-levrek", name: "Levrek buğulama", kcal: 380, meal: "dinner", tags: ["white-meat", "fish"], cuisine: "turkish", custom: false },
  { id: "d-tavuk-k", name: "Köri soslu tavuk + pirinç", kcal: 560, meal: "dinner", tags: ["white-meat"], cuisine: "turkish", custom: false },
  { id: "d-alinazik", name: "Alinazik", kcal: 560, meal: "dinner", tags: ["red-meat"], cuisine: "turkish", custom: false },
  { id: "d-kazandibi", name: "Kazandibi", kcal: 320, meal: "dinner", tags: ["dessert", "dairy"], cuisine: "turkish", custom: false },
  { id: "d-kunefe", name: "Künefe", kcal: 520, meal: "dinner", tags: ["dessert"], cuisine: "turkish", custom: false },
  { id: "d-ayva", name: "Ayva tatlısı", kcal: 280, meal: "dinner", tags: ["dessert", "light"], cuisine: "turkish", custom: false },
  // Indian
  { id: "i-masala", name: "Masala omelette + paratha", kcal: 480, meal: "breakfast", tags: ["egg"], cuisine: "indian", custom: false },
  { id: "i-poha", name: "Poha (flattened rice)", kcal: 320, meal: "breakfast", tags: ["light", "cereal"], cuisine: "indian", custom: false },
  { id: "i-dal", name: "Dal tadka + jeera rice", kcal: 450, meal: "lunch", tags: ["legume"], cuisine: "indian", custom: false },
  { id: "i-chana", name: "Chana masala + roti", kcal: 480, meal: "lunch", tags: ["legume"], cuisine: "indian", custom: false },
  { id: "i-aloo", name: "Aloo gobi + rice", kcal: 420, meal: "lunch", tags: ["vegetable"], cuisine: "indian", custom: false },
  { id: "i-sambar", name: "Sambar + idli", kcal: 380, meal: "lunch", tags: ["legume", "soup"], cuisine: "indian", custom: false },
  { id: "i-raita", name: "Mixed veg + raita salad", kcal: 220, meal: "lunch", tags: ["salad", "vegetable"], cuisine: "indian", custom: false },
  { id: "i-butter", name: "Butter chicken + naan", kcal: 650, meal: "dinner", tags: ["white-meat"], cuisine: "indian", custom: false },
  { id: "i-biryani", name: "Chicken biryani + raita", kcal: 620, meal: "dinner", tags: ["white-meat"], cuisine: "indian", custom: false },
  { id: "i-tandoori", name: "Tandoori chicken + dal", kcal: 550, meal: "dinner", tags: ["white-meat"], cuisine: "indian", custom: false },
  { id: "i-paneer", name: "Palak paneer + roti", kcal: 480, meal: "dinner", tags: ["vegetable", "dairy"], cuisine: "indian", custom: false },
  { id: "i-samosa", name: "Samosa (3 pcs) + chutney", kcal: 400, meal: "dinner", tags: ["pastry"], cuisine: "indian", custom: false },
  { id: "i-gulab", name: "Gulab jamun (3 pcs)", kcal: 350, meal: "dinner", tags: ["dessert"], cuisine: "indian", custom: false },
  // Filipino
  { id: "f-tapsilog", name: "Tapsilog (beef + egg + rice)", kcal: 550, meal: "breakfast", tags: ["egg", "red-meat"], cuisine: "filipino", custom: false },
  { id: "f-champorado", name: "Champorado + tuyo", kcal: 420, meal: "breakfast", tags: ["sweet", "cereal"], cuisine: "filipino", custom: false },
  { id: "f-sinigang", name: "Sinigang na baboy + rice", kcal: 480, meal: "lunch", tags: ["soup", "red-meat"], cuisine: "filipino", custom: false },
  { id: "f-pinakbet", name: "Pinakbet + rice", kcal: 380, meal: "lunch", tags: ["vegetable"], cuisine: "filipino", custom: false },
  { id: "f-ginisang", name: "Ginisang munggo + rice", kcal: 400, meal: "lunch", tags: ["legume"], cuisine: "filipino", custom: false },
  { id: "f-lumpia", name: "Lumpiang shanghai + rice", kcal: 450, meal: "lunch", tags: ["pastry"], cuisine: "filipino", custom: false },
  { id: "f-ensalada", name: "Ensaladang talong", kcal: 180, meal: "lunch", tags: ["salad", "vegetable"], cuisine: "filipino", custom: false },
  { id: "f-adobo", name: "Chicken adobo + rice", kcal: 560, meal: "dinner", tags: ["white-meat"], cuisine: "filipino", custom: false },
  { id: "f-lechon", name: "Lechon kawali + rice", kcal: 650, meal: "dinner", tags: ["red-meat"], cuisine: "filipino", custom: false },
  { id: "f-pancit", name: "Pancit canton + lumpia", kcal: 520, meal: "dinner", tags: ["pastry"], cuisine: "filipino", custom: false },
  { id: "f-kare", name: "Kare-kare + bagoong rice", kcal: 600, meal: "dinner", tags: ["red-meat"], cuisine: "filipino", custom: false },
  { id: "f-halo", name: "Halo-halo", kcal: 380, meal: "dinner", tags: ["dessert"], cuisine: "filipino", custom: false },
  // Russian
  { id: "r-syrniki", name: "Syrniki + smetana", kcal: 450, meal: "breakfast", tags: ["dairy", "sweet"], cuisine: "russian", custom: false },
  { id: "r-kasha", name: "Buckwheat kasha + milk", kcal: 350, meal: "breakfast", tags: ["cereal"], cuisine: "russian", custom: false },
  { id: "r-blini", name: "Blini + tvorog", kcal: 420, meal: "breakfast", tags: ["pastry", "dairy"], cuisine: "russian", custom: false },
  { id: "r-borscht", name: "Borscht + smetana + bread", kcal: 380, meal: "lunch", tags: ["soup", "vegetable"], cuisine: "russian", custom: false },
  { id: "r-shchi", name: "Shchi (cabbage soup)", kcal: 300, meal: "lunch", tags: ["soup", "vegetable"], cuisine: "russian", custom: false },
  { id: "r-olivier", name: "Olivier salad", kcal: 350, meal: "lunch", tags: ["salad"], cuisine: "russian", custom: false },
  { id: "r-vinegret", name: "Vinegret salad", kcal: 280, meal: "lunch", tags: ["salad", "vegetable"], cuisine: "russian", custom: false },
  { id: "r-pelmeni", name: "Pelmeni + smetana", kcal: 550, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "russian", custom: false },
  { id: "r-stroganoff", name: "Beef stroganoff + mash", kcal: 620, meal: "dinner", tags: ["red-meat"], cuisine: "russian", custom: false },
  { id: "r-cutlet", name: "Pozharsky cutlet + buckwheat", kcal: 540, meal: "dinner", tags: ["white-meat"], cuisine: "russian", custom: false },
  { id: "r-plov", name: "Plov (lamb pilaf)", kcal: 600, meal: "dinner", tags: ["red-meat"], cuisine: "russian", custom: false },
  { id: "r-medovik", name: "Medovik (honey cake)", kcal: 420, meal: "dinner", tags: ["dessert"], cuisine: "russian", custom: false },
  // World
  { id: "w-pancakes", name: "Pancakes + maple syrup", kcal: 480, meal: "breakfast", tags: ["sweet", "pastry"], cuisine: "world", custom: false },
  { id: "w-full", name: "Full English breakfast", kcal: 650, meal: "breakfast", tags: ["egg", "meat"], cuisine: "world", custom: false },
  { id: "w-croissant", name: "Croissant + coffee", kcal: 380, meal: "breakfast", tags: ["pastry"], cuisine: "world", custom: false },
  { id: "w-caesar", name: "Caesar salad + chicken", kcal: 420, meal: "lunch", tags: ["salad", "white-meat"], cuisine: "world", custom: false },
  { id: "w-club", name: "Club sandwich + fries", kcal: 600, meal: "lunch", tags: ["pastry", "white-meat"], cuisine: "world", custom: false },
  { id: "w-tomato-pasta", name: "Pasta al pomodoro", kcal: 480, meal: "lunch", tags: ["pastry", "vegetable"], cuisine: "world", custom: false },
  { id: "w-friedrice", name: "Egg fried rice + spring rolls", kcal: 520, meal: "lunch", tags: ["cereal"], cuisine: "world", custom: false },
  { id: "w-spagbol", name: "Spaghetti bolognese", kcal: 580, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "world", custom: false },
  { id: "w-pizza", name: "Margherita pizza", kcal: 620, meal: "dinner", tags: ["pastry", "dairy"], cuisine: "world", custom: false },
  { id: "w-burger", name: "Cheeseburger + fries", kcal: 700, meal: "dinner", tags: ["red-meat", "pastry"], cuisine: "world", custom: false },
  { id: "w-salmon", name: "Grilled salmon + mash", kcal: 480, meal: "dinner", tags: ["white-meat", "fish"], cuisine: "world", custom: false },
  { id: "w-roast", name: "Roast beef + yorkshire", kcal: 640, meal: "dinner", tags: ["red-meat"], cuisine: "world", custom: false },
];

export const CUISINES = [
  { id: "turkish", label: "🇹🇷 Turkish" },
  { id: "indian", label: "🇮🇳 Indian" },
  { id: "filipino", label: "🇵🇭 Filipino" },
  { id: "russian", label: "🇷🇺 Russian" },
  { id: "world", label: "🌍 World" },
];

export const MEALS: { id: MenuMeal; label: string; hint: string }[] = [  { id: "breakfast", label: "Kahvaltı", hint: "yumurta & hamur işi önerilir" },
  { id: "lunch", label: "Öğle", hint: "sebze & bakliyat ağırlıklı" },
  { id: "dinner", label: "Akşam", hint: "kırmızı/beyaz et & hamur işi" },
];

export function dishesForMeal(meal: MenuMeal, extra: Dish[] = [], cuisine = "turkish") {
  const inC = (d: Dish) => (d.cuisine || "turkish") === cuisine || (d.custom && cuisine === (d.cuisine || "turkish"));
  return [...DISHES.filter((d) => d.meal === meal && inC(d)), ...extra.filter((d) => d.meal === meal && (d.cuisine || "turkish") === cuisine)];
}

// Auto-generate a balanced week: rotating mains, lunch = soup + veg main + salad.
export function autoWeek(extra: Dish[] = [], cuisine = "turkish"): Record<string, { text: string; kcal: number }> {
  const bf0 = dishesForMeal("breakfast", extra, cuisine);
  const bf = bf0.length ? bf0 : dishesForMeal("breakfast", extra, "turkish");
  const pool = (meal: MenuMeal, pred: (d: Dish) => boolean) => {
    const p = dishesForMeal(meal, extra, cuisine).filter(pred);
    return p.length ? p : dishesForMeal(meal, extra, "turkish").filter(pred);
  };
  const soups = pool("lunch", (d) => d.tags.includes("soup"));
  const vegs = pool("lunch", (d) => (d.tags.includes("vegetable") || d.tags.includes("legume")) && !d.tags.includes("soup") && !d.tags.includes("salad"));
  const salads = pool("lunch", (d) => d.tags.includes("salad"));
  const meats = pool("dinner", (d) => d.tags.includes("red-meat") || d.tags.includes("white-meat"));
  const desserts = pool("dinner", (d) => d.tags.includes("dessert"));
  const out: Record<string, { text: string; kcal: number }> = {};
  for (let day = 0; day < 7; day++) {
    const b = bf[day % bf.length];
    const s = soups[day % soups.length];
    const v = vegs[day % vegs.length];
    const sa = salads[day % salads.length];
    const m = meats[day % meats.length];
    const de = desserts[(day + 2) % desserts.length];
    out[`${day}-breakfast`] = { text: b.name, kcal: b.kcal };
    out[`${day}-lunch`] = { text: `${s.name} + ${v.name} + ${sa.name}`, kcal: s.kcal + v.kcal + sa.kcal };
    out[`${day}-dinner`] = { text: `${m.name} + ${de.name}`, kcal: m.kcal + de.kcal };
  }
  return out;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function mondayOf(date: Date) {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addWeek(weekStart: string, n: number) {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + n * 7);
  return mondayOf(d);
}

export function dayLabel(weekStart: string, dayIndex: number) {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + dayIndex);
  return `${DAY_NAMES[dayIndex]} ${d.getDate()}.${d.getMonth() + 1}`;
}
