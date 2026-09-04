export interface Product {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Dell' | 'Lenovo' | 'ASUS' | 'Google' | 'Sony';
  category: 'Laptops' | 'Smartphones' | 'Audio & Wearables' | 'Tablets & Displays' | 'Accessories';
  price: number; // in PKR
  originalPrice: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tagline: string;
  description: string;
  specs: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
    battery?: string;
    camera?: string;
    os?: string;
    warranty: string;
  };
  featured?: boolean;
  bestDeal?: boolean;
}

export const PRODUCTS: Product[] = [
  // 1. SMARTPHONES
  {
    id: 'P-1002',
    name: 'Samsung Galaxy S25 Ultra 5G (Galaxy AI)',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 395000,
    originalPrice: 460000,
    discountPercent: 14,
    stock: 14,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    tagline: 'Snapdragon 8 Elite | 200MP Quad Telephoto | Built-in S-Pen | Titanium Silver',
    description: 'The definitive 2025/2026 Android flagship with real-time Galaxy AI translation, 200MP camera, 5000mAh battery, and Corning Gorilla Armor anti-reflective display.',
    specs: {
      processor: 'Qualcomm Snapdragon 8 Elite (3nm)',
      ram: '16GB LPDDR5X',
      storage: '512GB UFS 4.0',
      display: '6.9" Dynamic AMOLED 2X, 120Hz, 3000 nits',
      battery: '5000 mAh with 45W Fast Charging',
      camera: '200MP Main + 50MP 5x Periscope + 50MP 3x + 50MP Ultra-Wide',
      os: 'Android 15 with One UI 7.0 (7 Years OS Updates)',
      warranty: '1 Year Official Samsung Pakistan Warranty'
    },
    featured: true,
    bestDeal: true
  },
  {
    id: 'P-1005',
    name: 'Apple iPhone 16 Pro Max (Desert Titanium)',
    brand: 'Apple',
    category: 'Smartphones',
    price: 435000,
    originalPrice: 490000,
    discountPercent: 11,
    stock: 9,
    rating: 4.9,
    reviewsCount: 218,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tagline: 'A18 Pro Chip | Apple Intelligence | Dedicated Camera Control Button | 5x Telephoto',
    description: 'Grade 5 Titanium design with the thinnest borders on any Apple device, A18 Pro 3nm silicon, 4K 120 fps Dolby Vision recording, and up to 33 hours video playback.',
    specs: {
      processor: 'Apple A18 Pro (6-core CPU, 6-core GPU, 16-core NPU)',
      ram: '8GB Unified RAM',
      storage: '256GB NVMe',
      display: '6.9" Super Retina XDR OLED, ProMotion 120Hz',
      battery: '4685 mAh (Up to 33 hours battery life)',
      camera: '48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto',
      os: 'iOS 18 with Apple Intelligence',
      warranty: '1 Year Official Apple Mercantile Warranty'
    },
    featured: true,
    bestDeal: true
  },
  {
    id: 'P-1006',
    name: 'Apple iPhone 16 Pro (Natural Titanium)',
    brand: 'Apple',
    category: 'Smartphones',
    price: 395000,
    originalPrice: 440000,
    discountPercent: 10,
    stock: 14,
    rating: 4.9,
    reviewsCount: 164,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tagline: 'A18 Pro Silicon | Apple Intelligence | ProMotion 120Hz | 48MP Camera Fusion',
    description: 'The compact pro flagship with Grade 5 Titanium finish, studio-quality microphones, Camera Control touch sensor, and full Apple Intelligence integration.',
    specs: {
      processor: 'Apple A18 Pro (3nm Pro Architecture)',
      ram: '8GB Unified RAM',
      storage: '256GB NVMe',
      display: '6.3" Super Retina XDR OLED, 120Hz ProMotion',
      battery: '3582 mAh (Up to 27 hours battery life)',
      camera: '48MP Main Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto',
      os: 'iOS 18 with Apple Intelligence',
      warranty: '1 Year Official Apple Mercantile Warranty'
    },
    featured: true,
    bestDeal: false
  },
  {
    id: 'P-1007',
    name: 'Apple iPhone 16 (Ultramarine 128GB)',
    brand: 'Apple',
    category: 'Smartphones',
    price: 310000,
    originalPrice: 350000,
    discountPercent: 11,
    stock: 20,
    rating: 4.8,
    reviewsCount: 135,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    tagline: 'A18 Bionic Chip | Action Button | Spatial Video & Photo | Dynamic Island',
    description: 'Vibrant color-infused glass back with aerospace-grade aluminum, dual 48MP Fusion camera with 2x optical-quality telephoto, and Action button.',
    specs: {
      processor: 'Apple A18 Chip (6-core CPU, 5-core GPU)',
      ram: '8GB RAM',
      storage: '128GB NVMe',
      display: '6.1" Super Retina XDR OLED Display',
      battery: '3561 mAh (Up to 22 hours video playback)',
      camera: '48MP Fusion Camera + 12MP Ultra-Wide with Macro',
      os: 'iOS 18 with Apple Intelligence',
      warranty: '1 Year Official Apple Mercantile Warranty'
    },
    featured: false,
    bestDeal: true
  },
  {
    id: 'P-1009',
    name: 'Apple iPhone 15 (Midnight Black 128GB)',
    brand: 'Apple',
    category: 'Smartphones',
    price: 255000,
    originalPrice: 285000,
    discountPercent: 10,
    stock: 18,
    rating: 4.8,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    tagline: 'A16 Bionic | Dynamic Island | 48MP Main Camera | USB-C Connectivity',
    description: 'High-value Apple flagship with color-infused glass back, Dynamic Island alerts, 48MP super-high-resolution main camera, and universal USB-C charging.',
    specs: {
      processor: 'Apple A16 Bionic (6-core CPU, 5-core GPU)',
      ram: '6GB RAM',
      storage: '128GB NVMe',
      display: '6.1" Super Retina XDR OLED',
      battery: '3349 mAh (Up to 20 hours video playback)',
      camera: '48MP Main + 12MP Ultra-Wide',
      os: 'iOS 17/18 Upgradeable',
      warranty: '1 Year Official Apple Mercantile Warranty'
    },
    featured: false,
    bestDeal: false
  },
  {
    id: 'P-1008',
    name: 'Google Pixel 9 Pro XL (Gemini AI Edition)',
    brand: 'Google',
    category: 'Smartphones',
    price: 310000,
    originalPrice: 360000,
    discountPercent: 14,
    stock: 12,
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    tagline: 'Google Tensor G4 | On-Device Gemini Nano | 50MP Pro Triple Camera System',
    description: 'Engineered for Google AI with Gemini Live, Super Actua Display, polished obsidian aerospace-grade aluminum frame, and 7 years of Pixel Feature Drops.',
    specs: {
      processor: 'Google Tensor G4 with Titan M2 Security',
      ram: '16GB LPDDR5X',
      storage: '256GB UFS 3.1',
      display: '6.8" Super Actua OLED (1-120Hz, 3000 nits)',
      battery: '5060 mAh with 37W Fast Charging',
      camera: '50MP Main + 48MP 5x Telephoto + 48MP Ultra-Wide',
      os: 'Android 15 (7 Years Guaranteed OS & Security Updates)',
      warranty: '1 Year International Warranty'
    },
    featured: false,
    bestDeal: true
  },
  {
    id: 'P-1012',
    name: 'Samsung Galaxy Z Fold 6 5G (Dual Screen)',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 490000,
    originalPrice: 570000,
    discountPercent: 14,
    stock: 6,
    rating: 4.7,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    tagline: 'Dual Dynamic AMOLED 2X | Ultra-Slim Armor Aluminum | Galaxy AI Multitasking',
    description: 'Thinner, lighter, and more durable. Features an expansive 7.6-inch tablet-class inner screen with enhanced S-Pen precision and Note Assist AI.',
    specs: {
      processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      ram: '12GB LPDDR5X',
      storage: '512GB UFS 4.0',
      display: '7.6" Main QXGA+ 120Hz + 6.3" Cover AMOLED 120Hz',
      battery: '4400 mAh with Dual-Cell Distribution',
      camera: '50MP Main + 10MP 3x Telephoto + 12MP Ultra-Wide',
      os: 'Android 14 with One UI 6.1.1 (Upgradable to 7.0)',
      warranty: '1 Year Official Samsung Pakistan Warranty'
    },
    featured: false,
    bestDeal: false
  },

  // 2. LAPTOPS
  {
    id: 'P-1001',
    name: 'Apple MacBook Pro 16" (M3 Max / M4 Pro)',
    brand: 'Apple',
    category: 'Laptops',
    price: 485000,
    originalPrice: 550000,
    discountPercent: 12,
    stock: 8,
    rating: 5.0,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    tagline: 'Apple M3 Max 14-Core CPU | 36GB Unified Memory | 1TB SSD | Liquid Retina XDR',
    description: 'Unmatched performance for machine learning engineers, 3D artists, and software developers. Over 22 hours of battery life with zero thermal throttling.',
    specs: {
      processor: 'Apple M3 Max (14-core CPU, 30-core GPU, 16-core Neural Engine)',
      ram: '36GB Unified LPDDR5 Memory',
      storage: '1TB NVMe High-Speed SSD (Up to 7.4 GB/s)',
      display: '16.2" Liquid Retina XDR, ProMotion 120Hz, 1600 nits peak HDR',
      battery: '100Wh Lithium-Polymer (Up to 22 Hours)',
      os: 'macOS Sequoia',
      warranty: '2 Years Official Apple Care International Warranty'
    },
    featured: true,
    bestDeal: true
  },
  {
    id: 'P-1003',
    name: 'Dell XPS 16 (2025/2026 Core Ultra 7 AI)',
    brand: 'Dell',
    category: 'Laptops',
    price: 440000,
    originalPrice: 510000,
    discountPercent: 14,
    stock: 11,
    rating: 4.8,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    tagline: 'Intel Core Ultra 7 155H | NVIDIA RTX 4070 8GB | 4K+ OLED Touch | Platinum Silver',
    description: 'CNC machined aluminum with Gorilla Glass 3 palm rest, invisible seamless glass haptic trackpad, capacitive touch function row, and studio quad speakers.',
    specs: {
      processor: 'Intel Core Ultra 7 155H (16 Cores, 22 Threads, Built-in NPU)',
      ram: '32GB LPDDR5X 7467 MHz',
      storage: '1TB PCIe Gen4 NVMe SSD',
      display: '16.3" 4K+ (3840 x 2400) OLED Touch, 100% DCI-P3, 500 nits',
      battery: '99.5Wh Battery with 130W USB-C ExpressCharge',
      os: 'Windows 11 Pro with Copilot+ AI',
      warranty: '2 Years Official Dell Premier On-Site Warranty'
    },
    featured: true,
    bestDeal: true
  },
  {
    id: 'P-1004',
    name: 'Lenovo Legion Pro 7i Gen 9 (AI Gaming Flagship)',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 520000,
    originalPrice: 610000,
    discountPercent: 15,
    stock: 5,
    rating: 4.9,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    tagline: 'Intel Core i9-14900HX | NVIDIA GeForce RTX 4080 12GB (175W) | 240Hz PureSight',
    description: 'Powered by Lenovo LA-2Q AI tuning chip. Coldfront: Vapor chamber cooling system delivering uncompromised framerates for AAA gaming and generative AI workloads.',
    specs: {
      processor: 'Intel Core i9-14900HX (24 Cores, 32 Threads, 5.8 GHz Turbo)',
      ram: '32GB DDR5 5600 MHz (Dual Channel)',
      storage: '1TB PCIe 4.0 NVMe M.2 SSD',
      display: '16" WQXGA (2560x1600) IPS 240Hz, 100% DCI-P3, 500 nits, G-SYNC',
      battery: '99.99Wh with 330W GaN Slim Adapter',
      os: 'Windows 11 Home',
      warranty: '2 Years Official Lenovo Legion Ultimate Support'
    },
    featured: true,
    bestDeal: false
  },
  {
    id: 'P-1006',
    name: 'Samsung Galaxy Book 4 Ultra (Touch OLED)',
    brand: 'Samsung',
    category: 'Laptops',
    price: 480000,
    originalPrice: 560000,
    discountPercent: 14,
    stock: 7,
    rating: 4.8,
    reviewsCount: 53,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    tagline: 'Intel Core Ultra 9 185H | NVIDIA RTX 4070 | 16" 3K AMOLED 2X 120Hz Touch',
    description: 'Ultra-thin, featherlight chassis with anti-reflective Dynamic AMOLED 2X touch display, Vision Booster AI, and seamless Galaxy Phone ecosystem continuity.',
    specs: {
      processor: 'Intel Core Ultra 9 185H (Intel AI Boost NPU)',
      ram: '32GB LPDDR5X',
      storage: '1TB NVMe SSD + Dual M.2 Expansion Slot',
      display: '16.0" 3K (2880x1800) Dynamic AMOLED 2X 120Hz Touch, Anti-Glare',
      battery: '76Wh with 140W Ultra-Fast USB-C Charger',
      os: 'Windows 11 Home with Samsung Galaxy Connected Experience',
      warranty: '1 Year Official Samsung Warranty'
    },
    featured: false,
    bestDeal: true
  },
  {
    id: 'P-1007',
    name: 'ASUS ROG Zephyrus G16 (2025/2026 OLED)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 495000,
    originalPrice: 580000,
    discountPercent: 15,
    stock: 6,
    rating: 4.9,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
    tagline: 'AMD Ryzen AI 9 HX 370 (50 TOPS) | RTX 4080 | 2.5K 240Hz ROG Nebula OLED',
    description: 'Precision CNC aluminum unibody with Slash Lighting matrix lid, 240Hz 0.2ms OLED display, and liquid metal thermal compound in a 1.85kg ultrabook form factor.',
    specs: {
      processor: 'AMD Ryzen AI 9 HX 370 (12 Cores, 24 Threads, 50 NPU TOPS)',
      ram: '32GB LPDDR5X 7500 MHz',
      storage: '2TB PCIe 4.0 NVMe SSD',
      display: '16" 2.5K (2560x1600) ROG Nebula OLED 240Hz 0.2ms, G-SYNC, 500 nits',
      battery: '90Wh Battery with 240W Adapter + 100W USB-C PD',
      os: 'Windows 11 Pro',
      warranty: '2 Years ASUS Perfect Warranty (includes accidental damage)'
    },
    featured: false,
    bestDeal: false
  },
  {
    id: 'P-1009',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12 (AI Business)',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 390000,
    originalPrice: 450000,
    discountPercent: 13,
    stock: 15,
    rating: 4.9,
    reviewsCount: 67,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    tagline: 'Intel Core Ultra 7 165U vPro | 32GB RAM | 14" 2.8K OLED 120Hz | Ultralight 1.09 kg',
    description: 'The executive gold standard. Aerospace-grade carbon fiber body, legendary ThinkPad TrackPoint keyboard, 4G LTE/5G ready, and hardware-level biometric security.',
    specs: {
      processor: 'Intel Core Ultra 7 165U vPro (12 Cores, 14 Threads)',
      ram: '32GB LPDDR5X 6400 MHz',
      storage: '1TB PCIe Gen4 Performance NVMe SSD',
      display: '14.0" 2.8K (2880 x 1800) OLED 120Hz, Eyesafe Certified, 400 nits',
      battery: '57Wh with Rapid Charge (80% in 60 min)',
      os: 'Windows 11 Pro',
      warranty: '3 Years Lenovo Premier On-Site Support'
    },
    featured: false,
    bestDeal: false
  },

  // 3. TABLETS & AUDIO & ACCESSORIES
  {
    id: 'P-1011',
    name: 'Apple iPad Pro 13" M4 (Ultra Retina Tandem OLED)',
    brand: 'Apple',
    category: 'Tablets & Displays',
    price: 340000,
    originalPrice: 390000,
    discountPercent: 13,
    stock: 10,
    rating: 4.9,
    reviewsCount: 104,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    tagline: 'Apple M4 Chip (Next-Gen NPU) | Tandem OLED 1000 nits | Apple Pencil Pro Support',
    description: 'The thinnest Apple product ever made at just 5.1mm. Features groundbreaking Tandem OLED display technology and the power of the M4 silicon for creative pros.',
    specs: {
      processor: 'Apple M4 Chip (9-core CPU, 10-core GPU, 38 TOPS Neural Engine)',
      ram: '8GB Unified Memory',
      storage: '256GB SSD',
      display: '13.0" Ultra Retina XDR Tandem OLED, ProMotion 120Hz, 1600 nits HDR',
      battery: '38.99Wh (Up to 10 hours web/video)',
      camera: '12MP Wide + LiDAR Scanner + Landscape 12MP Center Stage',
      os: 'iPadOS 18',
      warranty: '1 Year Official Apple Warranty'
    },
    featured: true,
    bestDeal: false
  },
  {
    id: 'P-1010',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    brand: 'Sony',
    category: 'Audio & Wearables',
    price: 95000,
    originalPrice: 120000,
    discountPercent: 21,
    stock: 22,
    rating: 4.9,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tagline: 'Dual Processors & 8 Microphones | 30-Hour Battery | LDAC Hi-Res Audio | Platinum Silver',
    description: 'World-renowned noise cancellation with integrated processor V1 and HD noise cancelling processor QN1. Crystal-clear hands-free calling with beamforming microphones.',
    specs: {
      processor: 'Sony Integrated Processor V1 + HD QN1',
      battery: '30 Hours with ANC On (3-minute charge = 3 hours playback)',
      display: 'N/A (30mm Precision Driver Units)',
      warranty: '1 Year Official Sony Pakistan Warranty'
    },
    featured: true,
    bestDeal: true
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'Sparkles', count: 12 },
  { id: 'Smartphones', name: 'Smartphones', icon: 'Smartphone', count: 4 },
  { id: 'Laptops', name: 'Laptops & Systems', icon: 'Laptop', count: 6 },
  { id: 'Tablets & Displays', name: 'Tablets & Displays', icon: 'Tablet', count: 1 },
  { id: 'Audio & Wearables', name: 'Audio & Wearables', icon: 'Headphones', count: 1 },
  { id: 'Accessories', name: 'Tech Accessories', icon: 'Layers', count: 3 }
];
