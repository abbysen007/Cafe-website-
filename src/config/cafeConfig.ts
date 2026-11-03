import { Dish, DishCategory, CategoryInfo } from '../types/cafe';

/**
 * =========================================================================
 * CAFE CONFIGURATION
 * Change the brand name, tagline, currency, or contact information here.
 * The entire application automatically inherits these values.
 * =========================================================================
 */
export const CAFE_CONFIG = {
  brandName: 'BREW.',
  tagline: 'Specialty Coffee & Roastery',
  subheading: 'Where exceptional origins meet architectural ambience.',
  currencySymbol: '₹',
  whatsappNumber: '919876543210', // Editable WhatsApp number
  contact: {
    address: '42 Roasted Lane, Indiranagar, Bengaluru, KA 560038',
    phone: '+91 (080) 4120 8899',
    email: 'concierge@brew-specialty.com',
    hoursWeekday: '07:00 AM – 10:00 PM',
    hoursWeekend: '08:00 AM – 11:30 PM',
  },
  socials: [
    { name: 'Instagram', handle: '@brew.roastery', href: 'https://instagram.com' },
    { name: 'X / Twitter', handle: '@brewcoffee', href: 'https://twitter.com' },
    { name: 'Spotify', handle: 'BREW. Lounge Acoustics', href: 'https://spotify.com' },
  ],
  promos: {
    firstOrderCode: 'BREW20',
    firstOrderDiscountPercent: 20,
    freeDeliveryThreshold: 500,
  },
};

/**
 * Optional Google Maps Geocoding API key:
 * If left empty (''), the app uses free OpenStreetMap Nominatim reverse geocoding and search.
 * To use Google Geocoding API, provide your key below.
 */
export const GOOGLE_MAPS_API_KEY: string = '';

/**
 * =========================================================================
 * ACCURATE DELIVERY ZONE & FEE CONFIGURATION
 * =========================================================================
 */
export const DELIVERY_CONFIG = {
  cafeLat: 12.9719,
  cafeLng: 77.6412, // Indiranagar 100ft Rd Roastery, Bengaluru
  cafeName: 'BREW. Flagship Roastery (Indiranagar)',
  maxDeliveryKm: 6.0,
  feeTiers: [
    { maxKm: 2, fee: 30, label: '0–2 km (Local Indiranagar)' },
    { maxKm: 4, fee: 50, label: '2–4 km (Neighbourhood)' },
    { maxKm: 6, fee: 70, label: '4–6 km (Extended Area)' },
  ],
  calculateFee: (distanceKm: number): number | null => {
    if (distanceKm > 6.0) return null; // out of delivery zone
    if (distanceKm <= 2.0) return 30;
    if (distanceKm <= 4.0) return 50;
    return 70;
  },
};

/**
 * =========================================================================
 * ORDER TRACKING & ADMIN CONFIGURATION
 * All values are editable in one place.
 * =========================================================================
 */
export const ORDER_TRACKING_CONFIG = {
  adminPin: '1234', // Editable cafe admin dashboard PIN
  cafePhone: '+91 (080) 4120 8899', // Editable cafe contact phone
  cafeCoords: {
    lat: 12.9719,
    lng: 77.6412, // Indiranagar 100ft Rd Roastery, Bengaluru
    label: 'BREW. Flagship Roastery',
  },
  // Default delivery destination coordinates offset for Bangalore demo
  defaultCustomerCoords: {
    lat: 12.9805,
    lng: 77.6535, // ~2.1 km east in Indiranagar Defence Colony
  },
  // Simulation Delays (in seconds from order creation timestamp)
  simulationDelaysSeconds: {
    confirmed: 8, // Confirmed after 8s
    preparing: 25, // Being Prepared after 25s
    outForDeliveryOrReady: 90, // Out for Delivery / Ready to Serve after 90s (1.5 min)
    deliveredOrServed: 240, // Delivered / Served after ~4 min
  },
  cancellationWindowSeconds: 60, // Cancel allowed for first 60 seconds
  defaultRider: {
    name: 'Karthik Verma',
    phone: '+91 98765 43211',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    vehicle: 'Electric Espresso Moped (KA-03-BW-7822)',
  },
};


/**
 * =========================================================================
 * 3D / AR MODEL ASSETS (KhronosGroup Sample Assets via jsdelivr CDN)
 * -------------------------------------------------------------------------
 * Swap `modelSrc` on each dish below with your own 3D scanned food assets.
 * =========================================================================
 */
export const DEFAULT_SAMPLE_GLB_MODELS = {
  teacup: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb',
  dishWithOlives: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/IridescentDishWithOlives/glTF-Binary/IridescentDishWithOlives.glb',
  avocado: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Avocado/glTF-Binary/Avocado.glb',
  waterBottle: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
  sheenChair: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/SheenChair/glTF-Binary/SheenChair.glb',
  antiqueCamera: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
};

/**
 * Universal Secondary Fallback Model:
 * If a dish's primary modelSrc fails to load, ARModal automatically tries
 * this backup before showing the fallback card.
 */
export const BACKUP_FALLBACK_GLB_MODEL =
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb';

/**
 * CATEGORIES
 */
export const CAFE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Coffee',
    name: 'Specialty Coffee',
    description: 'Single-origin espresso, pour-overs, and velvety textured milk brews.',
    icon: 'Coffee',
    count: 4,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Cold Drinks',
    name: 'Cold & Chilled',
    description: '24-hour slow drip cold brews, sparkling tonics, and iced infusions.',
    icon: 'Wine',
    count: 3,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Bakery',
    name: 'Artisan Bakery',
    description: 'French butter croissants, sourdough loaves, and delicate laminated pastries.',
    icon: 'Croissant',
    count: 3,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Breakfast',
    name: 'Warm Breakfast',
    description: 'Truffled scrambled eggs, avocado brioche, and organic granola bowls.',
    icon: 'Egg',
    count: 2,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Desserts',
    name: 'Confections',
    description: 'Tiramisu al caffe, dark chocolate mousse, and pistachio tartlets.',
    icon: 'Cake',
    count: 2,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Snacks',
    name: 'Savory Bites',
    description: 'Burrata crostini, smoked olive focaccia, and truffle parmesan fries.',
    icon: 'Utensils',
    count: 2,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * =========================================================================
 * ALL DISHES & 3D AR ASSETS (Single Source of Truth for Hero, Menu & AR)
 * -------------------------------------------------------------------------
 * Every dish includes: id, name, category, price, rating, shortTagline,
 * heroTitle (line1 & line2), description, origin/ingredients, image, modelSrc.
 * =========================================================================
 */
export const DISHES: Dish[] = [
  {
    id: 'signature-velvet-cappuccino',
    name: 'Signature Velvet Cappuccino',
    category: 'Coffee',
    price: 280,
    rating: 4.9,
    reviewsCount: 342,
    shortTagline: 'Signature Roast',
    heroTitle: {
      line1: 'Velvet',
      line2: 'Cappuccino.',
    },
    description: 'Double ristretto pull of Ethiopian Yirgacheffe folded into micro-textured steamed whole milk with hand-poured rosette.',
    origin: 'Ethiopia Yirgacheffe Grade 1 • 88.5 SCA Cup Score • Double Ristretto',
    tastingNotes: ['Bergamot', 'Milk Chocolate', 'Toasted Hazelnut'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.teacup,
    calories: 140,
    prepTime: '4 mins',
    temperature: 'Hot',
    roastOrigin: 'Ethiopia Yirgacheffe Grade 1',
  },
  {
    id: 'kyoto-cold-drip-amber',
    name: 'Kyoto 24-Hour Cold Drip',
    category: 'Cold Drinks',
    price: 320,
    rating: 4.95,
    reviewsCount: 289,
    shortTagline: '24h Slow Drip',
    heroTitle: {
      line1: 'Kyoto Amber',
      line2: 'Cold Drip.',
    },
    description: 'Slow single-drop extraction through custom Japanese glass towers over 24 hours. Served over a hand-carved ice sphere.',
    origin: 'Guatemala Huehuetenango • Single-Drop Alchemy • Hand-Carved Ice Sphere',
    tastingNotes: ['Dark Cocoa', 'Black Cherry', 'Oak Finish'],
    tag: "Chef's Special",
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.waterBottle,
    calories: 10,
    prepTime: '2 mins',
    temperature: 'Iced',
    roastOrigin: 'Guatemala Huehuetenango',
  },
  {
    id: 'artisan-butter-croissant',
    name: 'French Butter Croissant',
    category: 'Bakery',
    price: 220,
    rating: 4.85,
    reviewsCount: 412,
    shortTagline: 'Dawn Bakery',
    heroTitle: {
      line1: 'French Butter',
      line2: 'Croissant.',
    },
    description: '27 laminated layers of pure Normandy AOP butter and unbleached stoneground wheat. Baked fresh every morning at 6:30 AM.',
    origin: 'Normandy AOP Butter • 27 Laminated Folds • Stoneground Wheat',
    tastingNotes: ['Cultured Butter', 'Crisp Honey Crust', 'Light Flake'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.avocado,
    calories: 290,
    prepTime: 'Instant',
    temperature: 'Warm',
  },
  {
    id: 'single-origin-v60-pourover',
    name: 'V60 Pour-Over Reserve',
    category: 'Coffee',
    price: 340,
    rating: 4.92,
    reviewsCount: 198,
    shortTagline: 'Pour-Over Reserve',
    heroTitle: {
      line1: 'Panama Geisha',
      line2: 'V60 Reserve.',
    },
    description: 'Precision hand-poured single-origin roast calibrated to 93°C extraction. Clean, tea-like clarity and aromatic florals.',
    origin: 'Boquete Valley, Panama • 93°C Hand Extraction • Jasmine & Peach Notes',
    tastingNotes: ['Jasmine Florals', 'Peach Nectar', 'Meyer Lemon'],
    tag: 'New',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.dishWithOlives,
    calories: 5,
    prepTime: '6 mins',
    temperature: 'Hot',
    roastOrigin: 'Panama Geisha Boquete',
  },
  {
    id: 'espresso-con-panna',
    name: 'Espresso Con Panna',
    category: 'Coffee',
    price: 240,
    rating: 4.8,
    reviewsCount: 145,
    shortTagline: 'Classic Doppio',
    heroTitle: {
      line1: 'Espresso',
      line2: 'Con Panna.',
    },
    description: 'Rich concentrated espresso doppio crowned with a velvety cloud of Madagascar vanilla bean whipped cream.',
    origin: 'Colombia Huila Supremo • Madagascar Vanilla Bean Whipped Cream Cloud',
    tastingNotes: ['Intense Espresso', 'Sweet Cream', 'Dark Molasses'],
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.teacup,
    calories: 95,
    prepTime: '3 mins',
    temperature: 'Hot',
    roastOrigin: 'Colombia Huila Supremo',
  },
  {
    id: 'spanish-iced-cortado',
    name: 'Spanish Iced Cortado',
    category: 'Coffee',
    price: 260,
    rating: 4.88,
    reviewsCount: 231,
    shortTagline: 'Chilled Cortado',
    heroTitle: {
      line1: 'Spanish Iced',
      line2: 'Cortado.',
    },
    description: 'Equal parts dense espresso and sweet condensed milk shaken over ice cubes with a dusting of organic Ceylon cinnamon.',
    origin: 'Brazil Cerrado Natural • Sweet Condensed Milk • Ceylon Cinnamon Dust',
    tastingNotes: ['Caramel Dulce', 'Cinnamon Spice', 'Silky Body'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.waterBottle,
    calories: 165,
    prepTime: '3 mins',
    temperature: 'Iced',
    roastOrigin: 'Brazil Cerrado Natural',
  },
  {
    id: 'sparkling-cascara-tonic',
    name: 'Sparkling Cascara Tonic',
    category: 'Cold Drinks',
    price: 290,
    rating: 4.79,
    reviewsCount: 118,
    shortTagline: 'Botanical Fizz',
    heroTitle: {
      line1: 'Sparkling Cascara',
      line2: 'Craft Tonic.',
    },
    description: 'Botanical sparkling infusion brewed from sun-dried coffee fruit husks, craft Indian tonic, and burnt rosemary sprig.',
    origin: 'Costa Rica Tarrazu Coffee Husks • Artisanal Tonic • Burnt Rosemary',
    tastingNotes: ['Wild Hibiscus', 'Tamarind', 'Citrus Effervescence'],
    tag: 'Seasonal',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.waterBottle,
    calories: 45,
    prepTime: '3 mins',
    temperature: 'Iced',
    roastOrigin: 'Costa Rica Tarrazu',
  },
  {
    id: 'pistachio-matcha-cloud',
    name: 'Uji Matcha Pistachio Cloud',
    category: 'Cold Drinks',
    price: 350,
    rating: 4.87,
    reviewsCount: 176,
    shortTagline: 'Ceremonial Matcha',
    heroTitle: {
      line1: 'Uji Matcha',
      line2: 'Pistachio Cloud.',
    },
    description: 'Ceremonial grade Uji Kyoto matcha layered over artisanal oat milk, topped with a velvety cold foam infused with roasted pistachios.',
    origin: 'Uji Kyoto Ceremonial Matcha • Artisanal Oat Milk • Roasted Pistachio Foam',
    tastingNotes: ['Earthy Umami', 'Roasted Nut', 'Subtle Sweetness'],
    tag: 'New',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.waterBottle,
    calories: 180,
    prepTime: '4 mins',
    temperature: 'Iced',
  },
  {
    id: 'pain-au-chocolat-valrhona',
    name: 'Valrhona Pain au Chocolat',
    category: 'Bakery',
    price: 250,
    rating: 4.91,
    reviewsCount: 310,
    shortTagline: 'Artisan Pastry',
    heroTitle: {
      line1: 'Valrhona Pain',
      line2: 'Au Chocolat.',
    },
    description: 'Folded golden pastry encasing twin batons of French 70% Guanaja Valrhona dark chocolate, dusted with powdered sugar.',
    origin: 'Normandy Butter Pastry • French 70% Guanaja Valrhona Chocolate Batons',
    tastingNotes: ['Bittersweet Cacao', 'Buttery Layers', 'Crispy Crown'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.avocado,
    calories: 330,
    prepTime: 'Instant',
    temperature: 'Warm',
  },
  {
    id: 'cardamom-cinnamon-cruffin',
    name: 'Cardamom Cinnamon Cruffin',
    category: 'Bakery',
    price: 240,
    rating: 4.82,
    reviewsCount: 164,
    shortTagline: 'Morning Cruffin',
    heroTitle: {
      line1: 'Cardamom',
      line2: 'Cinnamon Cruffin.',
    },
    description: 'Hybrid croissant-muffin hybrid rolled in green cardamom sugar crystals, piped with salted espresso caramel.',
    origin: 'House Laminated Dough • Green Cardamom Sugar • Salted Espresso Caramel',
    tastingNotes: ['Aromatic Spice', 'Salted Caramel', 'Puff Core'],
    tag: 'Seasonal',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.avocado,
    calories: 310,
    prepTime: 'Instant',
    temperature: 'Warm',
  },
  {
    id: 'hass-avocado-truffle-toast',
    name: 'Hass Avocado & Truffle Brioche',
    category: 'Breakfast',
    price: 390,
    rating: 4.93,
    reviewsCount: 275,
    shortTagline: 'Warm Brioche',
    heroTitle: {
      line1: 'Hass Avocado',
      line2: 'Truffle Brioche.',
    },
    description: 'Crushed ripe Hass avocado on toasted house-baked brioche, poached organic egg, white truffle oil, and smoked chili sea salt.',
    origin: 'Ripe Hass Avocado • Poached Organic Egg • White Truffle Essence',
    tastingNotes: ['Creamy Avocado', 'Earthy White Truffle', 'Silky Yolk'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.avocado,
    calories: 420,
    prepTime: '8 mins',
    temperature: 'Warm',
  },
  {
    id: 'wild-mushroom-shakshuka',
    name: 'Wild Mushroom Roastery Shakshuka',
    category: 'Breakfast',
    price: 420,
    rating: 4.89,
    reviewsCount: 194,
    shortTagline: 'Cast Iron Skillet',
    heroTitle: {
      line1: 'Wild Mushroom',
      line2: 'Roastery Shakshuka.',
    },
    description: 'Cast-iron simmered San Marzano tomatoes, roasted foraged mushrooms, organic poached eggs, fresh labneh, and warm seeded sourdough.',
    origin: 'San Marzano Tomatoes • Foraged Wild Fungi • Labneh • Seeded Sourdough',
    tastingNotes: ['Umami Fungi', 'Tangy Tomato', 'Zesty Zaatar'],
    tag: "Chef's Special",
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.dishWithOlives,
    calories: 460,
    prepTime: '12 mins',
    temperature: 'Hot',
  },
  {
    id: 'roastery-tiramisu-classico',
    name: 'Tiramisù Al Caffè Espresso',
    category: 'Desserts',
    price: 360,
    rating: 4.96,
    reviewsCount: 388,
    shortTagline: 'House Confection',
    heroTitle: {
      line1: 'Tiramisù Al',
      line2: 'Caffè Espresso.',
    },
    description: 'House Savoiardi ladyfingers soaked in warm Ethiopia single-origin espresso and Marsala, layered with mascarpone cream and raw Dutch cocoa.',
    origin: 'Savoiardi Ladyfingers • Yirgacheffe Espresso Soak • Mascarpone & Raw Cocoa',
    tastingNotes: ['Espresso Liqueur', 'Airy Mascarpone', 'Bitter Cocoa'],
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.sheenChair,
    calories: 380,
    prepTime: 'Instant',
    temperature: 'Iced',
    roastOrigin: 'Ethiopia Yirgacheffe',
  },
  {
    id: 'smoked-burrata-crostini',
    name: 'Smoked Burrata & Heirloom Crostini',
    category: 'Snacks',
    price: 380,
    rating: 4.84,
    reviewsCount: 152,
    shortTagline: 'Savory Aperitivo',
    heroTitle: {
      line1: 'Smoked Burrata',
      line2: 'Heirloom Crostini.',
    },
    description: 'Pugliese smoked artisanal burrata, heirloom cherry tomatoes macerated in aged balsamic, basil oil, and grilled garlic sourdough.',
    origin: 'Pugliese Smoked Burrata • Aged Balsamic Heirlooms • Grilled Sourdough',
    tastingNotes: ['Creamy Curd', 'Sweet Acidic Tomato', 'Woodsmoke'],
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&q=80&fit=crop',
    modelSrc: DEFAULT_SAMPLE_GLB_MODELS.avocado,
    calories: 340,
    prepTime: '6 mins',
    temperature: 'Warm',
  },
];

/**
 * WHY CHOOSE US FEATURES
 */
export const FEATURES_DATA = [
  {
    id: 'arabica',
    title: '100% Specialty Arabica',
    subtitle: 'High Altitude Estates',
    description: 'We source exclusively from certified micro-lots above 1,600m with verified fair remuneration to farming collectives.',
    icon: 'Sparkles',
  },
  {
    id: 'roast',
    title: 'Precision Micro-Roasting',
    subtitle: 'Convection Profiling',
    description: 'Small 12kg batches profiled through gentle convective air to preserve nuanced florals and bright natural acidity.',
    icon: 'Flame',
  },
  {
    id: 'bakes',
    title: 'Dawn Artisan Bakery',
    subtitle: 'Normandy Butter & Sourdough',
    description: 'No preservatives or commercial premixes. Fermented overnight and pulled fresh from stone deck ovens each sunrise.',
    icon: 'Wheat',
  },
  {
    id: 'ar-dining',
    title: 'Interactive 3D AR Menu',
    subtitle: 'WebXR Spatial Preview',
    description: 'Inspect our dishes in lifelike 3D scale on your own table through augmented reality before ordering.',
    icon: 'Box',
  },
];

/**
 * PATRON TESTIMONIALS
 */
export const TESTIMONIALS = [
  {
    quote: 'The level of intention at BREW is unmatched in the city. The Kyoto Cold Drip is a revelation—silky, deep, and without a trace of astringency.',
    author: 'Aarav Mehta',
    role: 'Architect & Design Director',
    favoriteDish: 'Kyoto 24-Hour Cold Drip',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Being able to preview the pastry and brunch dishes right on our table in AR was so cool for our team. The French butter croissants taste like Paris.',
    author: 'Elena Rostova',
    role: 'Creative Technologist',
    favoriteDish: 'French Butter Croissant',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Their Ethiopia Yirgacheffe pour-over has clean peach nectar and jasmine notes that lingered for hours. The warm amber ambience makes it my second living room.',
    author: 'Vikramaditya Rao',
    role: 'SCA Certified Q-Grader',
    favoriteDish: 'Signature Velvet Cappuccino',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];
