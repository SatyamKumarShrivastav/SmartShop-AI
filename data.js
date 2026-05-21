// ===== DATA.JS — Products, Users, Sales Data =====

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Gaming'];

const PRODUCTS = [
  // ── Electronics ──
  { id: 1,  name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299, originalPrice: 399, rating: 4.8, reviews: 2847, tags: ['wireless','audio','premium','noise-cancelling'], emoji: '🎧', color: '#7C3AED', badge: 'Best Seller', monthlySales: [120,135,148,162,180,195,210,225,198,215,240,268], stock: 45 },
  { id: 2,  name: 'Smart Watch Pro X', category: 'Electronics', price: 449, originalPrice: 549, rating: 4.7, reviews: 1923, tags: ['wearable','fitness','smart','health'], emoji: '⌚', color: '#06B6D4', badge: 'New', monthlySales: [80,95,110,128,145,160,155,170,188,200,220,245], stock: 28 },
  { id: 3,  name: 'Mechanical RGB Keyboard', category: 'Electronics', price: 149, originalPrice: 199, rating: 4.6, reviews: 3412, tags: ['gaming','keyboard','rgb','mechanical'], emoji: '⌨️', color: '#F59E0B', badge: null, monthlySales: [200,210,225,240,255,270,260,280,300,315,330,350], stock: 72 },
  { id: 4,  name: '4K Ultra HD Webcam', category: 'Electronics', price: 199, originalPrice: 249, rating: 4.5, reviews: 876, tags: ['streaming','video','work','4k'], emoji: '📷', color: '#10B981', badge: null, monthlySales: [60,75,90,105,120,135,128,140,155,168,180,195], stock: 34 },
  { id: 5,  name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 89, originalPrice: 129, rating: 4.4, reviews: 4521, tags: ['wireless','audio','portable','outdoor'], emoji: '🔊', color: '#EF4444', badge: 'Hot', monthlySales: [280,295,310,328,345,360,350,370,390,405,420,445], stock: 89 },
  { id: 6,  name: 'USB-C 100W Fast Charger', category: 'Electronics', price: 59, originalPrice: 79, rating: 4.3, reviews: 6231, tags: ['charging','usb-c','fast','portable'], emoji: '⚡', color: '#8B5CF6', badge: null, monthlySales: [400,420,440,460,480,500,490,510,530,550,570,600], stock: 120 },
  // ── Fashion ──
  { id: 7,  name: 'Premium Leather Jacket', category: 'Fashion', price: 399, originalPrice: 599, rating: 4.9, reviews: 1243, tags: ['leather','premium','winter','style'], emoji: '🧥', color: '#92400E', badge: 'Trending', monthlySales: [95,80,70,60,55,50,65,80,110,140,180,210], stock: 18 },
  { id: 8,  name: 'Elite Running Sneakers', category: 'Fashion', price: 179, originalPrice: 249, rating: 4.6, reviews: 3187, tags: ['running','sports','comfortable','shoes'], emoji: '👟', color: '#F59E0B', badge: null, monthlySales: [150,160,175,190,200,210,200,215,230,245,260,280], stock: 55 },
  { id: 9,  name: 'Minimalist Silver Watch', category: 'Fashion', price: 249, originalPrice: 349, rating: 4.7, reviews: 892, tags: ['watch','minimalist','fashion','luxury'], emoji: '🕰️', color: '#6B7280', badge: null, monthlySales: [70,75,80,85,90,95,88,95,105,115,130,148], stock: 22 },
  { id: 10, name: 'Urban Travel Backpack', category: 'Fashion', price: 129, originalPrice: 169, rating: 4.5, reviews: 2341, tags: ['bag','travel','urban','waterproof'], emoji: '🎒', color: '#374151', badge: null, monthlySales: [180,190,200,215,225,235,225,240,255,270,290,315], stock: 63 },
  { id: 11, name: 'Polarized Aviator Sunglasses', category: 'Fashion', price: 79, originalPrice: 119, rating: 4.3, reviews: 1876, tags: ['sunglasses','summer','fashion','polarized'], emoji: '🕶️', color: '#0EA5E9', badge: null, monthlySales: [100,90,85,120,160,200,210,180,120,90,80,95], stock: 77 },
  // ── Home & Living ──
  { id: 12, name: 'Smart LED Desk Lamp', category: 'Home & Living', price: 69, originalPrice: 99, rating: 4.6, reviews: 2109, tags: ['smart','light','work','home','dimmable'], emoji: '💡', color: '#FCD34D', badge: null, monthlySales: [130,140,155,165,170,175,168,178,190,205,220,240], stock: 88 },
  { id: 13, name: 'HEPA Air Purifier Pro', category: 'Home & Living', price: 299, originalPrice: 399, rating: 4.8, reviews: 987, tags: ['air','health','home','hepa','purifier'], emoji: '🌬️', color: '#06B6D4', badge: 'Best Seller', monthlySales: [90,100,115,125,130,128,135,145,160,175,195,220], stock: 31 },
  { id: 14, name: 'Premium Coffee Maker', category: 'Home & Living', price: 199, originalPrice: 279, rating: 4.7, reviews: 3421, tags: ['coffee','kitchen','morning','espresso'], emoji: '☕', color: '#78350F', badge: null, monthlySales: [200,210,220,230,235,228,235,245,260,275,295,320], stock: 46 },
  { id: 15, name: 'Robot Vacuum Cleaner AI', category: 'Home & Living', price: 449, originalPrice: 599, rating: 4.8, reviews: 1654, tags: ['smart','cleaning','robot','home','ai'], emoji: '🤖', color: '#7C3AED', badge: 'New', monthlySales: [60,75,90,105,115,120,118,128,145,160,180,205], stock: 19 },
  { id: 16, name: 'Aromatherapy Diffuser', category: 'Home & Living', price: 49, originalPrice: 69, rating: 4.4, reviews: 4231, tags: ['wellness','home','relaxation','aromatherapy'], emoji: '🌿', color: '#10B981', badge: null, monthlySales: [250,260,270,280,285,278,285,295,310,325,345,370], stock: 95 },
  // ── Sports ──
  { id: 17, name: 'Premium Yoga Mat', category: 'Sports', price: 59, originalPrice: 89, rating: 4.7, reviews: 5632, tags: ['yoga','fitness','wellness','non-slip'], emoji: '🧘', color: '#8B5CF6', badge: null, monthlySales: [300,310,320,335,345,355,345,360,375,390,410,435], stock: 112 },
  { id: 18, name: 'Resistance Bands Pro Set', category: 'Sports', price: 39, originalPrice: 59, rating: 4.5, reviews: 7823, tags: ['fitness','strength','portable','training'], emoji: '💪', color: '#EF4444', badge: 'Hot', monthlySales: [450,465,480,498,510,522,512,528,545,562,580,605], stock: 178 },
  { id: 19, name: 'Smart Jump Rope Digital', category: 'Sports', price: 79, originalPrice: 109, rating: 4.4, reviews: 2341, tags: ['cardio','smart','fitness','calories'], emoji: '🪢', color: '#F59E0B', badge: null, monthlySales: [180,190,200,212,220,228,220,232,245,258,272,290], stock: 67 },
  { id: 20, name: 'Hydration Trail Backpack', category: 'Sports', price: 99, originalPrice: 139, rating: 4.6, reviews: 1432, tags: ['running','outdoor','hydration','trail'], emoji: '🏃', color: '#10B981', badge: null, monthlySales: [120,128,138,148,158,168,162,172,185,198,212,228], stock: 43 },
  { id: 21, name: 'Deep Tissue Foam Roller', category: 'Sports', price: 45, originalPrice: 65, rating: 4.5, reviews: 3456, tags: ['recovery','fitness','massage','muscle'], emoji: '🔵', color: '#0EA5E9', badge: null, monthlySales: [220,230,242,255,265,275,268,280,295,310,328,348], stock: 84 },
  // ── Books ──
  { id: 22, name: 'The Art of Innovation', category: 'Books', price: 24, originalPrice: 35, rating: 4.8, reviews: 8921, tags: ['business','creativity','leadership','design'], emoji: '📗', color: '#10B981', badge: 'Best Seller', monthlySales: [380,390,400,412,420,428,420,432,445,458,472,490], stock: 200 },
  { id: 23, name: 'Deep Learning Fundamentals', category: 'Books', price: 49, originalPrice: 69, rating: 4.7, reviews: 5432, tags: ['ml','tech','programming','ai','data'], emoji: '📘', color: '#3B82F6', badge: null, monthlySales: [290,302,315,328,340,352,344,358,372,388,404,422], stock: 156 },
  { id: 24, name: 'Atomic Habits', category: 'Books', price: 19, originalPrice: 28, rating: 4.9, reviews: 24312, tags: ['productivity','self-help','habits','mindset'], emoji: '📙', color: '#F59E0B', badge: 'Top Rated', monthlySales: [600,620,640,660,678,695,685,700,718,735,755,780], stock: 300 },
  { id: 25, name: 'Design Thinking Mastery', category: 'Books', price: 35, originalPrice: 49, rating: 4.6, reviews: 3210, tags: ['design','creativity','business','ux'], emoji: '📕', color: '#EF4444', badge: null, monthlySales: [210,220,232,244,254,264,256,268,282,296,312,330], stock: 134 },
  // ── Gaming ──
  { id: 26, name: 'Gaming Headset 7.1 Surround', category: 'Gaming', price: 179, originalPrice: 249, rating: 4.7, reviews: 4231, tags: ['gaming','audio','immersive','surround'], emoji: '🎮', color: '#7C3AED', badge: null, monthlySales: [190,202,215,228,240,252,244,258,272,288,305,325], stock: 58 },
  { id: 27, name: 'Pro Gaming Mouse 16K DPI', category: 'Gaming', price: 89, originalPrice: 129, rating: 4.8, reviews: 6543, tags: ['gaming','precision','rgb','ergonomic'], emoji: '🖱️', color: '#EF4444', badge: 'Hot', monthlySales: [350,365,380,396,410,424,415,430,446,462,480,500], stock: 93 },
  { id: 28, name: 'Ergonomic Gaming Chair', category: 'Gaming', price: 499, originalPrice: 699, rating: 4.6, reviews: 2109, tags: ['gaming','comfort','ergonomic','lumbar'], emoji: '🪑', color: '#1F2937', badge: null, monthlySales: [85,92,100,108,115,122,118,126,136,147,159,173], stock: 16 },
  { id: 29, name: 'VR Headset Pro 2', category: 'Gaming', price: 699, originalPrice: 899, rating: 4.5, reviews: 1876, tags: ['vr','gaming','immersive','metaverse'], emoji: '🥽', color: '#06B6D4', badge: 'New', monthlySales: [45,52,60,68,76,84,80,88,98,109,121,135], stock: 12 },
  { id: 30, name: 'Elite Controller Series X', category: 'Gaming', price: 149, originalPrice: 199, rating: 4.7, reviews: 3876, tags: ['gaming','controller','premium','haptic'], emoji: '🕹️', color: '#10B981', badge: null, monthlySales: [220,234,248,263,276,290,282,296,312,329,347,368], stock: 47 },
];

// ── Monthly Revenue Per Category (Jan-Dec last year) ──
const SALES_DATA = {
  Electronics:    { monthly: [450000,480000,510000,540000,580000,620000,590000,610000,650000,700000,750000,820000] },
  Fashion:        { monthly: [320000,290000,350000,420000,380000,360000,400000,430000,460000,490000,580000,640000] },
  'Home & Living':{ monthly: [280000,295000,310000,325000,340000,355000,345000,362000,382000,405000,435000,470000] },
  Sports:         { monthly: [210000,220000,240000,265000,285000,300000,295000,312000,330000,350000,370000,395000] },
  Books:          { monthly: [180000,188000,196000,205000,214000,223000,218000,228000,240000,254000,270000,290000] },
  Gaming:         { monthly: [380000,405000,430000,458000,485000,512000,498000,520000,548000,580000,618000,662000] },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FORECAST_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan+','Feb+','Mar+','Apr+','May+','Jun+'];

// ── User Personas ──
const USERS = [
  {
    id: 1, name: 'Alex Chen', avatar: '👨‍💻',
    preferences: ['Electronics','Gaming'],
    viewHistory:  [1,2,3,27,26,5],
    purchases:    [1,3],
    ratings:      { 1:5, 2:4, 3:5, 26:4, 27:5, 5:3 },
    bio: 'Tech enthusiast & hardcore gamer. Always looking for the latest gadgets.',
  },
  {
    id: 2, name: 'Priya Sharma', avatar: '👩‍🎨',
    preferences: ['Fashion','Sports'],
    viewHistory:  [7,8,9,11,17,18],
    purchases:    [7,17],
    ratings:      { 7:5, 8:4, 9:5, 17:5, 18:4, 11:3 },
    bio: 'Fashion lover and yoga enthusiast. Living the healthy lifestyle.',
  },
  {
    id: 3, name: 'Marcus Johnson', avatar: '👨‍🏫',
    preferences: ['Home & Living','Books'],
    viewHistory:  [12,13,14,22,24,23],
    purchases:    [14,22,24],
    ratings:      { 12:4, 13:5, 14:5, 22:5, 23:4, 24:5 },
    bio: 'Home improvement and lifelong learner. Coffee and books all day.',
  },
  {
    id: 4, name: 'Emma Rodriguez', avatar: '👩‍🏋️',
    preferences: ['Sports','Fashion'],
    viewHistory:  [17,18,19,20,21,8],
    purchases:    [17,18,19],
    ratings:      { 17:5, 18:5, 19:4, 20:4, 21:5, 8:4 },
    bio: 'Fitness coach and trail runner. Outdoor adventures are my thing.',
  },
  {
    id: 5, name: 'David Kim', avatar: '👨‍🎮',
    preferences: ['Gaming','Books'],
    viewHistory:  [26,27,28,29,30,23],
    purchases:    [27,30,23],
    ratings:      { 26:5, 27:5, 28:4, 29:4, 30:5, 23:5 },
    bio: 'Professional streamer and self-taught ML engineer. Game on!',
  },
];

// ── App State ──
const STATE = {
  currentUserId: 1,
  currentView: 'home',
  cart: [],
  filters: {
    category: [],
    priceMin: 0,
    priceMax: 700,
    minRating: 0,
    sort: 'default',
  },
  searchQuery: '',
  viewedProduct: null,
};

function getCurrentUser() {
  return USERS.find(u => u.id === STATE.currentUserId);
}

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getTotalRevenue() {
  return Object.values(SALES_DATA).reduce((acc, cat) => {
    return acc + cat.monthly.reduce((s, v) => s + v, 0);
  }, 0);
}

function getMonthlyTotalRevenue() {
  const totals = new Array(12).fill(0);
  Object.values(SALES_DATA).forEach(cat => {
    cat.monthly.forEach((v, i) => totals[i] += v);
  });
  return totals;
}
