// Galley recipes for the dishes in lib/menu.ts (serves 4 — scale to crew).
// Quantities are practical galley measures, not dietetic prescriptions.

export interface Recipe {
  serves: string;
  ingredients: string[];
  steps: string[];
}

export const RECIPES: Record<string, Recipe> = {
  "b-menemen": {
    serves: "4",
    ingredients: ["8 eggs", "4 ripe tomatoes, diced", "2 green peppers, chopped", "4 tbsp oil", "Salt, chili flakes"],
    steps: ["Soften peppers in oil 3–4 min.", "Add tomatoes, cook to a thick sauce (8 min).", "Crack in eggs, stir gently until just set.", "Serve bubbling with bread."],
  },
  "b-omlet": {
    serves: "4",
    ingredients: ["8 eggs", "4 tbsp milk", "40 g butter", "Salt, pepper"],
    steps: ["Whisk eggs with milk, salt, pepper.", "Foam butter, pour eggs, stir slowly pushing edges in.", "Fold when just set, serve immediately."],
  },
  "b-sucuk": {
    serves: "4",
    ingredients: ["200 g sucuk, sliced", "6 eggs", "1 tbsp butter"],
    steps: ["Crisp sucuk slices in butter 2 min.", "Crack eggs over, cook to taste.", "Serve in the pan with bread."],
  },
  "b-peynir": {
    serves: "4",
    ingredients: ["300 g white cheese", "150 g kaşar", "Olives, tomatoes, cucumber", "Olive oil, oregano"],
    steps: ["Slice cheeses, arrange with olives and vegetables.", "Drizzle oil, dust oregano.", "Serve with fresh bread."],
  },
  "b-kahvalti": {
    serves: "4",
    ingredients: ["Olives, tomatoes, cucumber, peppers", "Cheese + jam + honey", "Butter, bread"],
    steps: ["Wash and slice all vegetables.", "Arrange everything in small plates.", "Serve with hot tea."],
  },
  "b-bal": {
    serves: "4",
    ingredients: ["200 g kaymak", "8 tbsp honey", "Bread"],
    steps: ["Spread kaymak on plates.", "Pour warm honey over.", "Serve with hot bread."],
  },
  "b-krep": {
    serves: "4",
    ingredients: ["250 g flour", "500 ml milk", "2 eggs", "Pinch salt, oil for pan"],
    steps: ["Whisk to thin batter, rest 10 min.", "Ladle thin layer into hot oiled pan.", "Flip after 1 min; stack and serve with fillings."],
  },
  "b-tost": {
    serves: "4",
    ingredients: ["8 toast bread slices", "200 g kaşar", "Butter", "Optional: sucuk, tomato"],
    steps: ["Butter bread, fill with cheese.", "Toast in press until golden and melted.", "Rest 1 min, serve hot."],
  },
  "b-yulaf": {
    serves: "4",
    ingredients: ["160 g oats", "800 ml milk", "Honey, fruit, nuts"],
    steps: ["Simmer oats in milk 8–10 min, stirring.", "Rest 2 min to thicken.", "Top with honey, fruit, nuts."],
  },
  "b-simit": {
    serves: "4",
    ingredients: ["4 simit", "200 g white cheese", "Tomatoes, cucumber, olives"],
    steps: ["Warm simit in oven 5 min.", "Serve with cheese and vegetables.", "Tea is mandatory."],
  },
  "b-hasyumurta": {
    serves: "4",
    ingredients: ["8 eggs", "Water, salt", "Optional: olive oil + chili"],
    steps: ["Boil water, lower eggs gently.", "7 min soft, 10 min firm.", "Cool briefly, peel, season."],
  },
  "b-borek": {
    serves: "4",
    ingredients: ["500 g yufka", "300 g cheese + parsley", "200 ml milk + 2 eggs + oil (sauce)"],
    steps: ["Layer buttered yufka, pour sauce between layers.", "Spread cheese filling mid-way.", "Bake 180°C ~35 min until golden."],
  },
  "b-pogaca": {
    serves: "4",
    ingredients: ["500 g flour", "100 ml oil + 100 g yogurt", "1 egg + 1 yolk for glaze", "Cheese/potato filling"],
    steps: ["Knead soft dough, rest 20 min.", "Fill, shape, brush yolk.", "Bake 180°C ~25 min."],
  },
  "b-acma": {
    serves: "4",
    ingredients: ["500 g flour", "Warm milk 250 ml", "Yeast, sugar, salt, oil"],
    steps: ["Knead, proof 1 hour.", "Shape rings/braids.", "Bake 180°C ~20 min."],
  },
  "b-muhlama": {
    serves: "4",
    ingredients: ["4 tbsp cornmeal", "4 tbsp butter", "300 g kolot/kaşar cheese", "1.5 cups water"],
    steps: ["Melt butter, toast cornmeal 3 min.", "Add water, stir to porridge.", "Melt in cheese, pull strings, serve hot."],
  },
  "b-patates": {
    serves: "4",
    ingredients: ["4 potatoes, diced", "6 eggs", "Oil, salt, chili"],
    steps: ["Crisp potatoes in oil 10 min.", "Crack eggs over, cover 3 min.", "Season and serve."],
  },
  "b-yogurt": {
    serves: "4",
    ingredients: ["800 g yogurt", "8 tbsp granola", "Honey, fruit"],
    steps: ["Spoon yogurt into bowls.", "Top granola, honey, fruit.", "Serve chilled."],
  },
  "b-sahanda": {
    serves: "4",
    ingredients: ["150 g sucuk", "6 eggs", "Butter, chili"],
    steps: ["Render sucuk in butter.", "Crack eggs, sunny-side, cover 2 min.", "Dust chili, serve in pan."],
  },
  "s-mercimek": {
    serves: "6",
    ingredients: ["2 cups red lentils", "1 onion + 1 carrot, diced", "1 tbsp tomato paste", "2 L water/stock", "Butter + mint for drizzle"],
    steps: ["Sweat onion/carrot, add paste.", "Add lentils + liquid, simmer 25 min.", "Blend smooth, season.", "Serve with butter-mint drizzle + lemon."],
  },
  "s-ezo": {
    serves: "6",
    ingredients: ["1 cup red lentils", "0.5 cup bulgur + rice mix", "1 onion, tomato paste", "2 L stock", "Mint + chili butter"],
    steps: ["Boil lentils/grains 20 min.", "Fry onion + paste, stir in.", "Simmer 10 min, season.", "Top with mint-chili butter."],
  },
  "s-tarhana": {
    serves: "6",
    ingredients: ["6 tbsp tarhana", "1 L cold water + 1 L stock", "Butter, tomato paste, mint"],
    steps: ["Whisk tarhana into cold liquid (no lumps).", "Bring to boil stirring constantly.", "Simmer 10 min.", "Finish with butter-paste-mint."],
  },
  "s-yayla": {
    serves: "6",
    ingredients: ["1 cup rice", "500 g yogurt + 1 egg + flour (liaison)", "2 L water", "Mint butter"],
    steps: ["Cook rice in water.", "Temper yogurt liaison with hot soup, stir in (never boil hard).", "Season, simmer gently 5 min.", "Drizzle mint butter."],
  },
  "s-domates": {
    serves: "6",
    ingredients: ["1 kg tomatoes", "1 onion", "2 tbsp flour + butter", "1.5 L stock + milk splash"],
    steps: ["Cook tomatoes/onion soft.", "Add flour, then stock.", "Blend, add milk, season.", "Serve with grated kaşar."],
  },
  "s-iskuembe": {
    serves: "6",
    ingredients: ["1 kg cleaned tripe", "Water + salt", "Garlic vinegar + butter-chili to serve"],
    steps: ["Boil tripe tender 2–3 hours, skim.", "Slice, return to strained stock.", "Season; serve with garlic vinegar + chili butter."],
  },
  "s-kelle": {
    serves: "6",
    ingredients: ["1 cleaned head/trotters", "Water, onion, bay", "Garlic vinegar + chili butter"],
    steps: ["Simmer meat falling-tender 3+ hours.", "Pick meat, strain stock.", "Serve meat in stock with vinegar + butter."],
  },
  "s-sebze": {
    serves: "6",
    ingredients: ["Mixed veg (carrot, potato, zucchini, peas)", "1 onion", "1.5 L stock", "Oil, salt"],
    steps: ["Sweat onion, add veg.", "Add stock, simmer 20 min.", "Blend half for body, season."],
  },
  "l-fasulye": {
    serves: "6",
    ingredients: ["500 g white beans (soaked)", "1 onion", "2 tbsp paste", "300 g lamb (optional)", "Oil, salt"],
    steps: ["Sweat onion (+ meat browned).", "Add paste, beans, hot water.", "Simmer ~1 hour tender.", "Rest 15 min, serve with rice."],
  },
  "l-nohut": {
    serves: "6",
    ingredients: ["500 g chickpeas (soaked)", "1 onion", "2 tbsp paste", "Oil, cumin, salt"],
    steps: ["Sweat onion + paste.", "Add chickpeas + hot water.", "Simmer ~1 hour.", "Serve with rice/pickles."],
  },
  "l-ispanak": {
    serves: "6",
    ingredients: ["1 kg spinach", "1 onion", "2 tbsp rice", "Tomato paste, oil"],
    steps: ["Wilt onion + paste.", "Add spinach + rice + water.", "Simmer 20 min.", "Serve with yogurt."],
  },
  "l-pirasa": {
    serves: "6",
    ingredients: ["1 kg leeks", "2 carrots", "Rice spoon + olive oil", "Lemon"],
    steps: ["Sweat leeks/carrots in oil.", "Add rice + water, simmer 25 min.", "Serve lukewarm with lemon."],
  },
  "l-barbunya": {
    serves: "6",
    ingredients: ["500 g borlotti (soaked)", "1 onion + carrot + potato", "Olive oil, paste"],
    steps: ["Boil beans 10 min, drain.", "Sweat veg + paste, add beans.", "Simmer 40 min, cool, olive oil finish."],
  },
  "l-turlu": {
    serves: "6",
    ingredients: ["Mixed veg (eggplant, zucchini, beans, potato, okra)", "Tomatoes + paste", "Oil, salt"],
    steps: ["Layer veg in pot with tomatoes.", "Add water to half, oil on top.", "Simmer 35 min undisturbed."],
  },
  "l-karnabahar": {
    serves: "6",
    ingredients: ["1 cauliflower", "1 onion", "Tomato paste", "Oil, salt"],
    steps: ["Sweat onion + paste.", "Add florets + water.", "Simmer 20 min."],
  },
  "l-musakka-k": {
    serves: "6",
    ingredients: ["4 zucchini", "300 g mince", "2 tomatoes + paste", "Oil"],
    steps: ["Fry zucchini slices lightly.", "Brown mince + tomatoes.", "Layer, bake 180°C 25 min."],
  },
  "l-bulgur": {
    serves: "6",
    ingredients: ["2 cups coarse bulgur", "1 onion + paste + butter", "3 cups stock"],
    steps: ["Sweat onion/paste in butter.", "Add bulgur, toast 2 min.", "Add stock, lid, low 15 min, rest."],
  },
  "l-sarma": {
    serves: "6",
    ingredients: ["500 g vine leaves", "1.5 cups rice", "Onion, herbs, olive oil, lemon"],
    steps: ["Mix rice filling.", "Roll tight finger-size.", "Layer pot, weight plate, water + oil, simmer 40 min."],
  },
  "l-coban": {
    serves: "6",
    ingredients: ["Tomatoes, cucumber, peppers, onion", "Olive oil, lemon, salt"],
    steps: ["Dice everything small.", "Dress oil + lemon + salt.", "Serve fresh."],
  },
  "l-mevsim": {
    serves: "6",
    ingredients: ["Seasonal greens", "Carrot, red cabbage", "Olive oil, vinegar"],
    steps: ["Wash, dry, chop.", "Dress just before serving."],
  },
  "l-musakka": {
    serves: "6",
    ingredients: ["3 eggplants", "300 g mince", "Tomatoes, peppers", "Oil"],
    steps: ["Salt/drain eggplant, fry.", "Brown mince with veg.", "Layer, bake 180°C 30 min."],
  },
  "l-kereviz": {
    serves: "6",
    ingredients: ["4 celeriac", "Carrots + potatoes", "Orange juice + olive oil"],
    steps: ["Cube veg, sweat in oil.", "Add orange juice + water.", "Simmer 25 min, serve lukewarm."],
  },
  "l-enginar": {
    serves: "6",
    ingredients: ["6 artichokes", "Peas + carrots + potato", "Olive oil, lemon, dill"],
    steps: ["Clean artichokes, rub lemon.", "Fill with peas mix.", "Braise in oil/water 30 min."],
  },
  "l-fasulye-p": {
    serves: "6",
    ingredients: ["1 kg green beans", "2 tomatoes + onion", "Olive oil"],
    steps: ["Sweat onion, add beans.", "Add tomatoes + water.", "Simmer 30 min."],
  },
  "l-bamya": {
    serves: "6",
    ingredients: ["750 g okra", "Tomatoes + onion", "Lemon juice, oil"],
    steps: ["Trim okra (keep caps).", "Sweat, add tomatoes + lemon.", "Simmer 25 min, no stirring."],
  },
  "l-nohut-p": {
    serves: "6",
    ingredients: ["2 cups rice", "1 cup cooked chickpeas", "Butter + stock"],
    steps: ["Toast rice in butter.", "Add chickpeas + stock.", "Lid, low 15 min, rest."],
  },
  "l-makarna-s": {
    serves: "6",
    ingredients: ["500 g pasta", "Mixed veg", "Garlic, olive oil, parmesan"],
    steps: ["Boil pasta al dente.", "Sauté veg + garlic.", "Toss with pasta water + cheese."],
  },
  "l-kisir": {
    serves: "6",
    ingredients: ["2 cups fine bulgur", "Paste + pomegranate sour", "Parsley, mint, onion, oil"],
    steps: ["Soak bulgur hot water 10 min.", "Knead with paste + sour.", "Fold herbs/onion, serve with lettuce."],
  },
  "l-gavur": {
    serves: "6",
    ingredients: ["Tomatoes, walnuts, pomegranate", "Peppers, herbs", "Pomegranate sour + oil"],
    steps: ["Dice tomatoes/peppers.", "Mix with walnuts + herbs.", "Dress, serve."],
  },
  "l-ton": {
    serves: "6",
    ingredients: ["3 cans tuna", "Greens, corn, olives", "Lemon + oil"],
    steps: ["Drain tuna, flake.", "Toss with greens.", "Dress and serve chilled."],
  },
  "d-tavuksote": {
    serves: "6",
    ingredients: ["1 kg chicken cubes", "2 peppers + 2 tomatoes", "Paste, garlic, oil"],
    steps: ["Sear chicken high heat.", "Add veg + paste.", "Simmer 15 min, serve over rice."],
  },
  "d-tavukizg": {
    serves: "6",
    ingredients: ["1 kg chicken thighs/breast", "Yogurt-lemon-oil marinade", "Salt, chili, oregano"],
    steps: ["Marinate 2+ hours.", "Grill 6–7 min per side.", "Rest, serve with salad."],
  },
  "d-etsote": {
    serves: "6",
    ingredients: ["1 kg beef cubes", "Peppers, tomatoes, onion", "Butter + oil"],
    steps: ["Sear beef hard, set aside.", "Sweat veg, return beef.", "Simmer 20 min tender."],
  },
  "d-pide": {
    serves: "6",
    ingredients: ["1 kg dough", "500 g mince + onion + peppers + tomato", "Butter"],
    steps: ["Roll long ovals.", "Spread filling.", "Bake 220°C 12 min, butter edges."],
  },
  "d-lahmacun": {
    serves: "6",
    ingredients: ["Thin dough rounds", "300 g mince + veg paste mix", "Parsley, lemon"],
    steps: ["Spread thin meat layer.", "Bake 230°C 8 min.", "Roll with parsley + lemon."],
  },
  "d-manti": {
    serves: "6",
    ingredients: ["500 g tiny dumplings (ready or hand-folded)", "Yogurt + garlic", "Butter + chili + mint"],
    steps: ["Boil mantı 8–10 min.", "Plate over garlic yogurt.", "Pour sizzling chili butter."],
  },
  "d-karniyarik": {
    serves: "6",
    ingredients: ["6 eggplants", "400 g mince + onion + tomato", "Oil for frying"],
    steps: ["Slit + fry eggplants.", "Stuff with cooked mince mix.", "Bake with tomato 25 min, serve with rice."],
  },
  "d-kofte": {
    serves: "6",
    ingredients: ["1 kg mince", "Grated onion + breadcrumbs", "Cumin, salt, pepper"],
    steps: ["Knead 10 min, rest.", "Shape patties.", "Grill/pan 5 min per side, serve with potatoes."],
  },
  "d-balik": {
    serves: "6",
    ingredients: ["1.5 kg fish fillets", "Olive oil, lemon, herbs", "Salad"],
    steps: ["Oil + season fish.", "Grill 4 min per side.", "Serve with lemon + salad."],
  },
  "d-hamsi": {
    serves: "6",
    ingredients: ["1.5 kg anchovies", "Cornmeal + salt", "Oil for frying, lemon"],
    steps: ["Dredge in salted cornmeal.", "Fry crisp 3 min per side.", "Drain, lemon, serve."],
  },
  "d-guven": {
    serves: "6",
    ingredients: ["800 g lamb/beef chunks", "Eggplant, peppers, tomatoes", "Clay pot or tray"],
    steps: ["Brown meat.", "Layer veg + meat in pot.", "Cover, bake 170°C 1.5 hours."],
  },
  "d-pirzola": {
    serves: "6",
    ingredients: ["12 lamb chops", "Oil, salt, pepper, oregano"],
    steps: ["Room-temp chops, season.", "Sear 3 min per side.", "Rest 5 min."],
  },
  "d-makarna": {
    serves: "6",
    ingredients: ["500 g pasta", "400 g mince + tomato sauce", "Cheese"],
    steps: ["Brown mince with sauce.", "Boil pasta.", "Combine, top cheese."],
  },
  "d-sutlac": {
    serves: "6",
    ingredients: ["1 L milk", "100 g rice", "150 g sugar", "Vanilla"],
    steps: ["Cook rice in milk 30 min.", "Add sugar, thicken 10 min.", "Chill; brûlée top optional."],
  },
  "d-baklava": {
    serves: "6",
    ingredients: ["40 phyllo sheets", "400 g walnuts/pistachio", "300 g butter", "Syrup: 3 cups sugar + 2 water + lemon"],
    steps: ["Layer buttered phyllo + nuts.", "Cut diamonds, bake 170°C 45 min.", "Pour cool syrup over hot baklava."],
  },
  "d-meyve": {
    serves: "6",
    ingredients: ["Seasonal fruit mix"],
    steps: ["Wash, peel, slice.", "Arrange chilled."],
  },
  "d-hunkar": {
    serves: "6",
    ingredients: ["600 g lamb cubes", "4 eggplants (smoky puree)", "Kaşar + milk + butter for beğendi"],
    steps: ["Braise lamb tender.", "Char eggplants, mash with butter/milk/cheese.", "Serve stew over beğendi."],
  },
  "d-tas": {
    serves: "6",
    ingredients: ["800 g beef", "Potatoes + carrots", "Paste, stock"],
    steps: ["Brown beef.", "Add veg + stock.", "Braise 1 hour, serve with bulgur."],
  },
  "d-ciger": {
    serves: "6",
    ingredients: ["800 g liver cubes", "Flour + salt", "Oil, onion salad + sumac"],
    steps: ["Dredge liver in flour.", "Flash-fry 2–3 min.", "Serve with onion-sumac salad."],
  },
  "d-tantuni": {
    serves: "6",
    ingredients: ["800 g thin beef strips", "Lavaş", "Tomato, onion, parsley, sumac"],
    steps: ["Sear strips on hot plate with oil/cotton oil.", "Season salt + chili.", "Wrap with salad in lavaş."],
  },
  "d-balik-t": {
    serves: "6",
    ingredients: ["1.5 kg fish", "Flour + cornmeal", "Oil, arugula, lemon"],
    steps: ["Dredge, fry crisp.", "Drain.", "Serve on arugula with lemon."],
  },
  "d-levrek": {
    serves: "6",
    ingredients: ["1.5 kg sea bass", "Lemon, onion, herbs", "Olive oil, splash water"],
    steps: ["Lay fish with lemon/onion.", "Add water + oil, cover.", "Steam-braise 20 min."],
  },
  "d-tavuk-k": {
    serves: "6",
    ingredients: ["1 kg chicken", "Curry + cream/coconut", "Rice"],
    steps: ["Sear chicken.", "Add curry sauce, simmer 15 min.", "Serve over rice."],
  },
  "d-alinazik": {
    serves: "6",
    ingredients: ["500 g lamb mince/kebab meat", "Smoky eggplant-yogurt base", "Butter + chili"],
    steps: ["Cook spiced mince.", "Prepare eggplant yogurt base.", "Top base with meat + chili butter."],
  },
  "d-kazandibi": {
    serves: "6",
    ingredients: ["1 L milk", "100 g rice flour + sugar", "Mastic optional"],
    steps: ["Cook pudding thick.", "Caramelise bottom in tray.", "Chill, slice, invert."],
  },
  "d-kunefe": {
    serves: "6",
    ingredients: ["500 g kadayıf", "400 g unsalted cheese", "Butter", "Syrup + pistachio"],
    steps: ["Butter-shred kadayıf, layer half.", "Cheese layer, cover.", "Cook both sides crisp, syrup + pistachio."],
  },
  "d-ayva": {
    serves: "6",
    ingredients: ["4 quinces", "Sugar + water + cloves", "Kaymak + pistachio"],
    steps: ["Halve quinces, poach in syrup 1 hour.", "Cool in syrup (turns red).", "Serve with kaymak."],
  },
  "i-masala": {
    serves: "4",
    ingredients: ["6 eggs", "Onion, tomato, chilies", "Turmeric, chili, parathas"],
    steps: ["Beat eggs with veg + spices.", "Cook omelette flat.", "Serve with hot parathas."],
  },
  "i-poha": {
    serves: "4",
    ingredients: ["300 g poha", "Onion, peas, peanuts", "Mustard seeds, turmeric, lemon"],
    steps: ["Rinse poha, drain.", "Temper seeds + onion/peas.", "Toss poha 3 min, lemon + peanuts."],
  },
  "i-dal": {
    serves: "6",
    ingredients: ["2 cups toor dal", "Tomato, garlic", "Tadka: ghee, cumin, chili", "Jeera rice"],
    steps: ["Boil dal soft 25 min.", "Temper spices in ghee, pour over.", "Simmer 10 min, serve with jeera rice."],
  },
  "i-chana": {
    serves: "6",
    ingredients: ["400 g chickpeas (soaked)", "Onion-tomato masala", "Chana masala spice", "Roti"],
    steps: ["Boil chickpeas tender.", "Fry masala, add spice.", "Simmer 20 min, serve with roti."],
  },
  "i-aloo": {
    serves: "6",
    ingredients: ["Potatoes + cauliflower", "Ginger, tomato", "Turmeric, cumin, garam masala"],
    steps: ["Fry potatoes/cauliflower lightly.", "Cook ginger-tomato base.", "Combine, simmer 15 min, serve with rice."],
  },
  "i-sambar": {
    serves: "6",
    ingredients: ["1 cup toor dal", "Mixed veg", "Sambar powder + tamarind", "Idli"],
    steps: ["Cook dal + veg.", "Add tamarind + sambar powder.", "Temper, serve with idli."],
  },
  "i-raita": {
    serves: "6",
    ingredients: ["500 g yogurt", "Cucumber, tomato, onion", "Cumin, salt, mint"],
    steps: ["Whisk yogurt.", "Fold veg + spices.", "Chill, serve as side salad."],
  },
  "i-butter": {
    serves: "6",
    ingredients: ["1 kg chicken", "Tomato-butter-cream sauce", "Garam masala, kasuri methi", "Naan"],
    steps: ["Marinate + grill chicken.", "Simmer in tomato-butter sauce 15 min.", "Cream finish, serve with naan."],
  },
  "i-biryani": {
    serves: "6",
    ingredients: ["750 g chicken", "500 g basmati", "Biryani masala, fried onions", "Yogurt marinade, saffron milk"],
    steps: ["Marinate chicken 2 hours.", "Parboil rice 70%.", "Layer + dum on low 30 min. Serve with raita."],
  },
  "i-tandoori": {
    serves: "6",
    ingredients: ["1 kg chicken", "Yogurt + tandoori masala + lemon", "Butter baste"],
    steps: ["Marinate overnight if possible.", "Roast 220°C 25 min.", "Baste butter, serve with dal."],
  },
  "i-paneer": {
    serves: "6",
    ingredients: ["500 g paneer", "Spinach puree", "Garlic, cream", "Roti"],
    steps: ["Blanch + puree spinach.", "Cook garlic, add puree.", "Add paneer + cream 5 min."],
  },
  "i-samosa": {
    serves: "4",
    ingredients: ["12 wrappers", "Potato-pea filling + spices", "Oil for frying"],
    steps: ["Fill + seal triangles.", "Fry 170°C golden.", "Serve with chutney."],
  },
  "i-gulab": {
    serves: "6",
    ingredients: ["Milk powder dough + cardamom", "Syrup: sugar + rose water"],
    steps: ["Roll smooth balls.", "Fry low until deep golden.", "Soak warm syrup 1 hour."],
  },
  "f-tapsilog": {
    serves: "4",
    ingredients: ["500 g tapa beef", "4 eggs + garlic rice", "Vinegar dip"],
    steps: ["Fry tapa crisp.", "Fry eggs + garlic rice.", "Plate trio with vinegar."],
  },
  "f-champorado": {
    serves: "4",
    ingredients: ["1 cup glutinous rice", "Tablea chocolate", "Sugar, milk", "Tuyo (dried fish) to serve"],
    steps: ["Boil rice soft.", "Melt tablea in, sweeten.", "Serve with milk + tuyo."],
  },
  "f-sinigang": {
    serves: "6",
    ingredients: ["800 g pork", "Tamarind soup base", "Kangkong, radish, eggplant, okra", "Rice"],
    steps: ["Boil pork tender.", "Add tamarind + veg in order.", "Sour-season, serve with rice."],
  },
  "f-pinakbet": {
    serves: "6",
    ingredients: ["Mixed veg + squash", "Bagoong (shrimp paste)", "Pork bits", "Rice"],
    steps: ["Sauté bagoong + pork.", "Add veg, splash water.", "Simmer 15 min, serve with rice."],
  },
  "f-ginisang": {
    serves: "6",
    ingredients: ["2 cups mung beans", "Garlic, onion, tomato", "Chicharon topping", "Rice"],
    steps: ["Boil beans soft.", "Sauté aromatics, combine.", "Top chicharon, rice."],
  },
  "f-lumpia": {
    serves: "6",
    ingredients: ["Wrappers + pork-veg filling", "Oil", "Sweet chili dip", "Rice"],
    steps: ["Roll tight.", "Fry golden.", "Serve with rice + dip."],
  },
  "f-ensalada": {
    serves: "6",
    ingredients: ["Grilled eggplants", "Tomato, onion", "Bagoong + vinegar"],
    steps: ["Grill + peel eggplant.", "Mash with tomato/onion.", "Dress bagoong-vinegar."],
  },
  "f-adobo": {
    serves: "6",
    ingredients: ["1 kg chicken", "Vinegar + soy sauce", "Garlic, bay, peppercorns", "Rice"],
    steps: ["Marinate 30 min.", "Simmer 30 min to glaze.", "Serve with rice."],
  },
  "f-lechon": {
    serves: "6",
    ingredients: ["1 kg pork belly", "Garlic, bay, lemongrass", "Oil for crisping", "Rice + liver sauce"],
    steps: ["Boil with aromatics 45 min.", "Air-dry, deep-fry crisp.", "Chop, serve with rice + sauce."],
  },
  "f-pancit": {
    serves: "6",
    ingredients: ["500 g canton noodles", "Chicken + veg + shrimp", "Soy-calamansi sauce", "Lumpia to serve"],
    steps: ["Sauté meat/veg.", "Add noodles + stock, toss dry.", "Serve with lumpia + calamansi."],
  },
  "f-kare": {
    serves: "6",
    ingredients: ["800 g oxtail/beef", "Peanut sauce + annatto", "Banana heart, eggplant, beans", "Bagoong rice"],
    steps: ["Braise meat tender 2 hours.", "Add veg in peanut sauce.", "Serve with bagoong rice."],
  },
  "f-halo": {
    serves: "4",
    ingredients: ["Shaved ice + evaporated milk", "Ube, leche flan, beans, nata, sago"],
    steps: ["Layer sweets in glass.", "Top shaved ice + milk.", "Mix and eat fast."],
  },
  "r-syrniki": {
    serves: "4",
    ingredients: ["500 g tvorog", "1 egg + flour", "Sugar, vanilla", "Smetana to serve"],
    steps: ["Mix + shape patties.", "Pan-fry golden both sides.", "Serve with smetana."],
  },
  "r-kasha": {
    serves: "4",
    ingredients: ["1.5 cups buckwheat", "Milk + butter", "Salt, sugar"],
    steps: ["Toast groats 2 min.", "Simmer in milk 15 min.", "Butter + rest 5 min."],
  },
  "r-blini": {
    serves: "4",
    ingredients: ["Batter: flour, milk, eggs", "Tvorog + smetana filling"],
    steps: ["Thin pancakes both sides.", "Fill tvorog, roll.", "Warm + smetana."],
  },
  "r-borscht": {
    serves: "6",
    ingredients: ["Beets + cabbage + potato + carrot", "Beef stock", "Smetana + dill + bread"],
    steps: ["Simmer beef stock.", "Add veg in order 30 min.", "Serve with smetana + dill."],
  },
  "r-shchi": {
    serves: "6",
    ingredients: ["Cabbage + potato", "Meat stock", "Smetana"],
    steps: ["Boil stock.", "Add cabbage/potato 25 min.", "Smetana to serve."],
  },
  "r-olivier": {
    serves: "6",
    ingredients: ["Potato, carrot, peas, eggs", "Pickles + sausage/chicken", "Mayo + salt"],
    steps: ["Boil + dice all.", "Mix with mayo.", "Chill 1 hour."],
  },
  "r-vinegret": {
    serves: "6",
    ingredients: ["Beets, potato, carrot, pickles", "Sauerkraut + onion", "Oil + salt"],
    steps: ["Boil + dice veg.", "Mix all with oil.", "Chill."],
  },
  "r-pelmeni": {
    serves: "6",
    ingredients: ["Dough + mince-onion filling", "Bay + pepper water", "Smetana / vinegar"],
    steps: ["Shape small dumplings.", "Boil float + 3 min.", "Serve with smetana."],
  },
  "r-stroganoff": {
    serves: "6",
    ingredients: ["800 g beef strips", "Onion + mushrooms", "Smetana + mustard", "Mash"],
    steps: ["Sear strips fast.", "Sauté onion/mushroom.", "Stir smetana (no boil), serve over mash."],
  },
  "r-cutlet": {
    serves: "6",
    ingredients: ["800 g chicken mince", "Bread + milk + onion", "Buckwheat to serve"],
    steps: ["Mix + shape oval cutlets.", "Pan-fry golden + cooked through.", "Serve with buckwheat."],
  },
  "r-plov": {
    serves: "6",
    ingredients: ["600 g lamb", "2 cups rice", "Carrot + onion + cumin", "Oil"],
    steps: ["Brown lamb + veg (zirvak).", "Add rice + water.", "Lid low 20 min, rest."],
  },
  "r-medovik": {
    serves: "6",
    ingredients: ["Honey sponge layers", "Smetana-cream frosting"],
    steps: ["Bake thin layers 5 min each.", "Stack with cream.", "Rest overnight, crumb-coat."],
  },
  "w-pancakes": {
    serves: "4",
    ingredients: ["Flour + milk + eggs + baking powder", "Maple syrup + butter"],
    steps: ["Mix lumpy batter.", "Griddle 2 min per side.", "Stack + syrup."],
  },
  "w-full": {
    serves: "4",
    ingredients: ["Eggs, bacon, sausages", "Beans, tomato, mushrooms", "Toast + tea"],
    steps: ["Fry all components.", "Warm beans.", "Plate full + toast."],
  },
  "w-croissant": {
    serves: "4",
    ingredients: ["4 croissants", "Butter + jam", "Coffee"],
    steps: ["Warm oven 5 min.", "Serve with butter/jam + coffee."],
  },
  "w-caesar": {
    serves: "6",
    ingredients: ["Romaine + grilled chicken", "Croutons + parmesan", "Caesar dressing"],
    steps: ["Grill + slice chicken.", "Toss leaves + dressing.", "Top chicken, cheese, croutons."],
  },
  "w-club": {
    serves: "4",
    ingredients: ["Toast + chicken + bacon", "Lettuce, tomato, egg", "Mayo + fries"],
    steps: ["Toast triple-decker.", "Skewer, cut diagonal.", "Serve with fries."],
  },
  "w-tomato-pasta": {
    serves: "6",
    ingredients: ["500 g pasta", "Tomato-garlic-basil sauce", "Parmesan"],
    steps: ["Simmer sauce 15 min.", "Boil pasta.", "Toss + cheese."],
  },
  "w-friedrice": {
    serves: "6",
    ingredients: ["Day-old rice", "Eggs + veg + soy", "Spring rolls to serve"],
    steps: ["Scramble egg, set aside.", "Wok rice + veg + soy.", "Fold egg, serve with rolls."],
  },
  "w-spagbol": {
    serves: "6",
    ingredients: ["500 g spaghetti", "Mince-tomato ragù", "Parmesan"],
    steps: ["Simmer ragù 30 min.", "Boil spaghetti.", "Top ragù + cheese."],
  },
  "w-pizza": {
    serves: "6",
    ingredients: ["Pizza dough", "Tomato + mozzarella + basil"],
    steps: ["Stretch dough thin.", "Top lightly.", "Bake max heat 8 min."],
  },
  "w-burger": {
    serves: "4",
    ingredients: ["800 g mince patties", "Buns + cheese", "Lettuce, tomato, fries"],
    steps: ["Season + grill patties.", "Melt cheese.", "Build + fries."],
  },
  "w-salmon": {
    serves: "6",
    ingredients: ["1.2 kg salmon", "Lemon + herbs", "Mash"],
    steps: ["Season fillets.", "Grill skin-down 6 min.", "Serve with mash + lemon."],
  },
  "w-roast": {
    serves: "6",
    ingredients: ["1.5 kg beef joint", "Yorkshire batter", "Roast veg + gravy"],
    steps: ["Roast 20 min/500g + 20.", "Bake puddings hot.", "Rest, carve, gravy."],
  },
};
