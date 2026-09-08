import csv
import json
from pathlib import Path
from datetime import datetime
from src.database.session import engine, SessionLocal, init_db
from src.database.models import User, Category, Product, Order, OrderItem
from src.config.settings import settings
from src.utils.logger import logger

# Seed User profiles
MOCK_USERS = [
    {
        "id": "CUS-001",
        "name": "Ali Raza",
        "email": "ali.raza@example.pk",
        "phone": "+92 300 1234567",
        "address": "House 42-B, Street 9, F-7/2",
        "city": "Islamabad",
    },
    {
        "id": "CUS-002",
        "name": "Sara Khan",
        "email": "sara.khan@example.pk",
        "phone": "+92 321 9876543",
        "address": "Apartment 402, Creek Vistas, Phase 8, DHA",
        "city": "Karachi",
    },
    {
        "id": "CUS-003",
        "name": "Bilal Ahmed",
        "email": "bilal.ahmed@example.pk",
        "phone": "+92 333 5551234",
        "address": "Plot 18, Block C, Gulberg III",
        "city": "Lahore",
    },
    {
        "id": "CUS-004",
        "name": "Zainab Malik",
        "email": "zainab.malik@example.pk",
        "phone": "+92 301 4443322",
        "address": "House 12, Sector E-11/3",
        "city": "Islamabad",
    },
    {
        "id": "CUS-005",
        "name": "Hamza Tariq",
        "email": "hamza.tariq@example.pk",
        "phone": "+92 345 8887766",
        "address": "Villa 9, Bahria Town Phase 4",
        "city": "Rawalpindi",
    }
]

# Standard Categories
CATEGORIES = [
    {"id": "smartphones", "name": "Smartphones", "slug": "Smartphones", "icon": "📱"},
    {"id": "laptops", "name": "Laptops & Workstations", "slug": "Laptops", "icon": "💻"},
    {"id": "audio", "name": "Audio & Wearables", "slug": "Audio & Wearables", "icon": "🎧"},
    {"id": "tablets", "name": "Tablets & Displays", "slug": "Tablets & Displays", "icon": "🖥️"},
    {"id": "accessories", "name": "Accessories", "slug": "Accessories", "icon": "⚡"}
]

# Verified 2026 Hardware Catalog for SWOO TECH MART
FLAGSHIP_PRODUCTS = [
    # 1. SMARTPHONES (2026 Flagships)
    {
        "id": "P-1002",
        "name": "Samsung Galaxy S26 Ultra 5G (Snapdragon 8 Elite Gen 2)",
        "brand": "Samsung",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 430000.0,
        "original_price": 480000.0,
        "discount_percent": 10,
        "stock": 16,
        "rating": 5.0,
        "reviews_count": 198,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
        "tagline": "Snapdragon 8 Elite Gen 2 (2nm) | 200MP Quad Periscope | 3200 nits Dynamic AMOLED 2X",
        "description": "The 2026 apex Android flagship featuring Qualcomm 2nm silicon, 200MP ISOCELL sensor with 100x Space Zoom, Corning Gorilla Armor 2, and satellite SOS connectivity.",
        "specs": {
            "processor": "Qualcomm Snapdragon 8 Elite Gen 2 (2nm)",
            "ram": "16GB LPDDR6 High-Speed RAM",
            "storage": "512GB UFS 4.1",
            "display": "6.9\" Dynamic AMOLED 2X, 1-120Hz LTPO, 3200 nits",
            "battery": "5200 mAh with 65W Super Fast Charging 3.0",
            "camera": "200MP Main + 50MP 5x Periscope + 50MP 3x + 50MP Ultra-Wide",
            "os": "Android 16 with One UI 8.0 (7 Years OS Updates)",
            "warranty": "1 Year Official Samsung Pakistan Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1005",
        "name": "Apple iPhone 18 Pro Max (2nm A20 Pro Silicon)",
        "brand": "Apple",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 495000.0,
        "original_price": 550000.0,
        "discount_percent": 10,
        "stock": 8,
        "rating": 5.0,
        "reviews_count": 310,
        "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple A20 Pro (2nm) | In-House C2 Modem | Under-Display Face ID | 12GB Unified RAM",
        "description": "Apple revolutionary September 2026 flagship built on TSMC 2nm process. Features the all-new Apple C2 modem, smaller Dynamic Island with under-display components, and 48MP periscope zoom.",
        "specs": {
            "processor": "Apple A20 Pro (2nm Architecture with 24-core Neural Engine)",
            "ram": "12GB Unified LPDDR5X RAM",
            "storage": "512GB NVMe PCIe Gen 5",
            "display": "6.9\" Super Retina XDR OLED ProMotion 120Hz, Ceramic Shield 3",
            "battery": "4950 mAh (Up to 36 hours video playback)",
            "camera": "48MP Fusion Wide + 48MP Ultra-Wide + 48MP 6x Periscope Zoom",
            "os": "iOS 20 with Apple Intelligence 2.0",
            "warranty": "1 Year Official Apple International Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1027",
        "name": "Apple iPhone Ultra (Foldable Titanium 7.8\")",
        "brand": "Apple",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 650000.0,
        "original_price": 720000.0,
        "discount_percent": 10,
        "stock": 5,
        "rating": 5.0,
        "reviews_count": 88,
        "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple First Foldable Smartphone | 7.8\" Inner Display | Titanium Dual Hinge | A20 Pro",
        "description": "Apple historic entry into foldable devices. Features a 7.8-inch zero-crease tandem OLED display, 5.3-inch cover screen, aerospace titanium frame, and A20 Pro silicon.",
        "specs": {
            "processor": "Apple A20 Pro (2nm Silicon)",
            "ram": "16GB Unified RAM",
            "storage": "512GB NVMe",
            "display": "7.8\" Inner Tandem OLED 120Hz + 5.3\" Outer Super Retina XDR",
            "battery": "5100 mAh with 45W MagSafe Fast Charge",
            "camera": "48MP Main + 48MP Ultra-Wide + 48MP 5x Telephoto",
            "os": "iOS 20 Fold Edition",
            "warranty": "2 Years AppleCare Official Coverage"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1028",
        "name": "Apple iPhone 17 Pro Max (A19 Pro Titanium)",
        "brand": "Apple",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 385000.0,
        "original_price": 440000.0,
        "discount_percent": 13,
        "stock": 22,
        "rating": 4.9,
        "reviews_count": 420,
        "image_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple A19 Pro (3nm) | 12GB RAM | 48MP Triple Periscope (6x Optical Zoom)",
        "description": "High-power titanium flagship with 12GB RAM for heavy on-device generative AI, 48MP periscope zoom, 3000 nits LTPO display, and 45W fast wired charging.",
        "specs": {
            "processor": "Apple A19 Pro (3nm)",
            "ram": "12GB LPDDR5X RAM",
            "storage": "256GB NVMe",
            "display": "6.9\" LTPO Super Retina XDR OLED, 120Hz, 3000 nits",
            "battery": "4823 mAh with 45W Fast Charging",
            "camera": "48MP Fusion + 48MP Ultra-Wide + 48MP 5x-6x Periscope",
            "os": "iOS 19/20 Upgradeable",
            "warranty": "1 Year Official Apple Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1029",
        "name": "Apple iPhone 17 Air (Ultra-Thin 5.5mm Design)",
        "brand": "Apple",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 320000.0,
        "original_price": 360000.0,
        "discount_percent": 11,
        "stock": 18,
        "rating": 4.9,
        "reviews_count": 154,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        "tagline": "Impossibly Thin 5.5mm Titanium Enclosure | A19 Bionic | 48MP Fusion",
        "description": "Apple slimmest iPhone ever produced. Just 5.5mm thin with a 6.6-inch ProMotion display, featherlight titanium chassis, and full Apple Intelligence.",
        "specs": {
            "processor": "Apple A19 Bionic (3nm)",
            "ram": "8GB RAM",
            "storage": "256GB NVMe",
            "display": "6.6\" Super Retina XDR OLED 120Hz ProMotion",
            "battery": "3800 mAh with Silicon-Carbon Battery",
            "camera": "48MP Fusion Camera",
            "os": "iOS 19/20",
            "warranty": "1 Year Official Apple Warranty"
        },
        "featured": False,
        "best_deal": False
    },
    {
        "id": "P-1030",
        "name": "Samsung Galaxy Z Fold 7 5G (Armor Titanium)",
        "brand": "Samsung",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 540000.0,
        "original_price": 620000.0,
        "discount_percent": 13,
        "stock": 7,
        "rating": 4.9,
        "reviews_count": 95,
        "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
        "tagline": "8.0\" Inner Dynamic AMOLED 2X | Snapdragon 8 Elite | Zero-Gap Hinge",
        "description": "The 2026 benchmark for foldable smartphones. 8.0-inch inner display with upgraded 200MP primary sensor, S-Pen Pro integration, and titanium unibody durability.",
        "specs": {
            "processor": "Qualcomm Snapdragon 8 Elite (2nm/3nm process)",
            "ram": "16GB LPDDR5X",
            "storage": "512GB UFS 4.1",
            "display": "8.0\" Inner QXGA+ 120Hz + 6.5\" Cover AMOLED 120Hz",
            "battery": "4800 mAh with Dual-Cell Distribution",
            "camera": "200MP Main + 50MP Telephoto + 12MP Ultra-Wide",
            "os": "Android 16 with One UI 8.0",
            "warranty": "1 Year Official Samsung Pakistan Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1008",
        "name": "Google Pixel 10 Pro (TSMC 3nm Tensor G5 & Gemini 2.0)",
        "brand": "Google",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 340000.0,
        "original_price": 390000.0,
        "discount_percent": 13,
        "stock": 14,
        "rating": 4.9,
        "reviews_count": 160,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
        "tagline": "TSMC 3nm Google Tensor G5 | On-Device Gemini 2.0 Multimodal | 50MP Triple Pro",
        "description": "Groundbreaking silicon upgrade manufactured by TSMC on 3nm. Delivers native multimodal Gemini 2.0 real-time reasoning and 50MP triple cameras.",
        "specs": {
            "processor": "Google Tensor G5 (Custom TSMC 3nm Architecture)",
            "ram": "16GB LPDDR5X",
            "storage": "256GB UFS 4.0",
            "display": "6.8\" Super Actua OLED 1-120Hz, 3200 nits peak",
            "battery": "5150 mAh with 45W Fast Charging",
            "camera": "50MP Main (f/1.68) + 48MP 5x Periscope + 48MP Ultra-Wide Macro",
            "os": "Android 16 (7 Years Guaranteed OS & Feature Drops)",
            "warranty": "1 Year International Warranty"
        },
        "featured": False,
        "best_deal": True
    },
    {
        "id": "P-1031",
        "name": "Huawei Mate XT 2 (Tri-Fold Dual-Hinge Screen)",
        "brand": "Huawei",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 780000.0,
        "original_price": 850000.0,
        "discount_percent": 8,
        "stock": 4,
        "rating": 5.0,
        "reviews_count": 42,
        "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
        "tagline": "10.2\" Tri-Fold 3K Display | Kirin 2026 (3nm) | Dual Hinge Precision",
        "description": "The world first commercial tri-fold flagship. Expands into a massive 10.2-inch workstation screen with Kirin 2026 silicon and Tiangong dual-hinge engineering.",
        "specs": {
            "processor": "HiSilicon Kirin 2026 (3nm Equivalent)",
            "ram": "16GB LPDDR6",
            "storage": "1TB High-Speed Storage",
            "display": "10.2\" 3K OLED (Unfolded) / 6.4\" (Folded) 120Hz LTPO",
            "battery": "5600 mAh Silicon-Carbon with 66W SuperCharge",
            "camera": "50MP Variable Aperture + 12MP Periscope + 12MP Ultra-Wide",
            "os": "HarmonyOS NEXT (Full In-House Kernel)",
            "warranty": "1 Year Official International Warranty"
        },
        "featured": True,
        "best_deal": False
    },

    # 2. LAPTOPS & COMPUTERS (2026 Flagships)
    {
        "id": "P-1001",
        "name": "Apple MacBook Pro 16\" (M5 Max Silicon Power 2026)",
        "brand": "Apple",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 560000.0,
        "original_price": 620000.0,
        "discount_percent": 10,
        "stock": 9,
        "rating": 5.0,
        "reviews_count": 145,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple M5 Max (16-Core CPU, 40-Core GPU) | Neural Accelerator 4x AI | 48GB RAM",
        "description": "Features dedicated Neural Accelerators in every GPU core, up to 24 hours battery life, Thunderbolt 5, and Liquid Retina XDR tandem technology.",
        "specs": {
            "processor": "Apple M5 Max (16-core CPU, 40-core GPU, 32-core Neural Engine)",
            "ram": "48GB Unified LPDDR5X-8533 Memory",
            "storage": "1TB NVMe Gen 5 SSD (Up to 8.2 GB/s)",
            "display": "16.2\" Liquid Retina XDR, ProMotion 120Hz, 1600 nits",
            "battery": "100Wh Lithium-Polymer (Up to 24 Hours)",
            "os": "macOS Tahoe / Sequoia",
            "warranty": "2 Years Official AppleCare International Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1013",
        "name": "Apple MacBook Pro 14\" (M5 Pro Silicon 2026)",
        "brand": "Apple",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 440000.0,
        "original_price": 490000.0,
        "discount_percent": 10,
        "stock": 14,
        "rating": 4.9,
        "reviews_count": 168,
        "image_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple M5 Pro (12-Core CPU, 18-Core GPU) | 24GB Unified Memory | 1TB SSD",
        "description": "Compact 14-inch powerhouse featuring Apple M5 Pro chip, dual external display support, Wi-Fi 7 N1 chip, and MagSafe 3 charging.",
        "specs": {
            "processor": "Apple M5 Pro with 16-core Neural Engine",
            "ram": "24GB Unified Memory",
            "storage": "1TB SSD",
            "display": "14.2\" Liquid Retina XDR 120Hz, 1600 nits",
            "battery": "72.4Wh (Up to 22 hours battery life)",
            "os": "macOS Sequoia/Tahoe",
            "warranty": "1 Year Official Apple Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1003",
        "name": "Dell XPS 16 (2026 Edition: Intel Panther Lake Tandem OLED)",
        "brand": "Dell",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 490000.0,
        "original_price": 560000.0,
        "discount_percent": 12,
        "stock": 10,
        "rating": 4.9,
        "reviews_count": 92,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
        "tagline": "Intel Panther Lake Core Ultra 9 | NVIDIA RTX 5070 8GB | Tandem 4K+ OLED",
        "description": "The 2026 Dell XPS flagship featuring Intel Panther Lake architecture, Tandem OLED display for zero glare and ultra-high contrast, and invisible glass haptics.",
        "specs": {
            "processor": "Intel Panther Lake Core Ultra 9 (16 Cores, 24 Threads, 60 NPU TOPS)",
            "ram": "32GB LPDDR5X 8533 MHz",
            "storage": "1TB PCIe Gen5 NVMe SSD",
            "display": "16.3\" 4K+ (3840 x 2400) Tandem OLED Touch, 100% DCI-P3, 600 nits",
            "battery": "99.5Wh with 130W USB-C ExpressCharge",
            "os": "Windows 11 Pro with Copilot+ AI",
            "warranty": "2 Years Official Dell Premier On-Site Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1007",
        "name": "ASUS ROG Zephyrus G16 (2026: RTX 5080 Laptop GPU)",
        "brand": "ASUS",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 570000.0,
        "original_price": 650000.0,
        "discount_percent": 12,
        "stock": 6,
        "rating": 5.0,
        "reviews_count": 115,
        "image_url": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
        "tagline": "Intel Core Ultra 9 Series 3 | NVIDIA GeForce RTX 5080 16GB (DLSS 4) | 240Hz OLED",
        "description": "Next-generation 2026 gaming ultrabook featuring Blackwell-architecture NVIDIA GeForce RTX 5080 GPU, DLSS 4 neural frame generation, and 0.2ms 240Hz OLED.",
        "specs": {
            "processor": "Intel Core Ultra 9 Series 3 (16 Cores, Intel AI Boost 65 TOPS)",
            "ram": "32GB LPDDR5X 8533 MHz",
            "storage": "2TB PCIe Gen5 NVMe SSD",
            "display": "16\" 2.5K (2560x1600) ROG Nebula OLED 240Hz 0.2ms, G-SYNC, 500 nits",
            "battery": "90Wh Battery with 240W Adapter + 100W USB-C PD",
            "os": "Windows 11 Pro",
            "warranty": "2 Years ASUS Perfect Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1004",
        "name": "Lenovo Legion Pro 7i Gen 10 (RTX 5090 Monster 2026)",
        "brand": "Lenovo",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 680000.0,
        "original_price": 770000.0,
        "discount_percent": 12,
        "stock": 5,
        "rating": 5.0,
        "reviews_count": 130,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        "tagline": "Intel Core Ultra 9 HX | NVIDIA GeForce RTX 5090 24GB (175W) | 240Hz PureSight",
        "description": "Uncompromising 2026 performance with NVIDIA RTX 5090 24GB GDDR7, Lenovo LA-3 AI tuning chip, and Coldfront vapor chamber cooling for AAA 4K gaming.",
        "specs": {
            "processor": "Intel Core Ultra 9-285HX (24 Cores, 32 Threads)",
            "ram": "64GB DDR5 6400 MHz (Dual Channel)",
            "storage": "2TB PCIe 5.0 NVMe M.2 SSD",
            "display": "16\" WQXGA (2560x1600) IPS 240Hz, 100% DCI-P3, 500 nits, G-SYNC",
            "battery": "99.99Wh with 330W GaN Slim Adapter",
            "os": "Windows 11 Home",
            "warranty": "2 Years Official Lenovo Legion Ultimate Support"
        },
        "featured": True,
        "best_deal": False
    },

    # 3. AUDIO & HEADPHONES
    {
        "id": "P-1014",
        "name": "Boso Over-Ear Wireless Headphone (3D Spatial Audio)",
        "brand": "Bose",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 89000.0,
        "original_price": 110000.0,
        "discount_percent": 19,
        "stock": 28,
        "rating": 4.9,
        "reviews_count": 245,
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
        "tagline": "World-Class Noise Cancelling | CustomTune Sound Calibration | 24-Hour Battery",
        "description": "Immerse yourself in concert-hall spatial audio with world-class noise cancellation, breakthrough Bose Immersive Audio, and luxuriously soft ear cushions.",
        "specs": {
            "processor": "Custom Bose Acoustic ANC Chipset",
            "battery": "24 Hours with ANC (15-minute quick charge gives 2.5 hours)",
            "warranty": "1 Year Official Bose International Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1010",
        "name": "Sony WH-1000XM5 Wireless Noise-Canceling",
        "brand": "Sony",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 95000.0,
        "original_price": 120000.0,
        "discount_percent": 21,
        "stock": 22,
        "rating": 4.9,
        "reviews_count": 310,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "tagline": "Dual V1/QN1 Processors | 8 Microphones | 30h Battery | Hi-Res LDAC Audio",
        "description": "Industry-leading active noise cancellation engineered with 8 microphones, precision voice pickup, and ultra-comfortable lightweight synthetic soft fit leather.",
        "specs": {
            "processor": "Sony Integrated Processor V1 + HD Noise Canceling Processor QN1",
            "battery": "30 Hours with ANC On",
            "warranty": "1 Year Official Sony Pakistan Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1015",
        "name": "Apple AirPods Pro 2 (USB-C Hearing Aid Certified)",
        "brand": "Apple",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 68000.0,
        "original_price": 78000.0,
        "discount_percent": 13,
        "stock": 35,
        "rating": 4.9,
        "reviews_count": 420,
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple H2 Silicon | 2x Active Noise Cancellation | Clinical Hearing Aid Capability",
        "description": "Next-level Active Noise Cancellation and Adaptive Audio, Personalized Spatial Audio with dynamic head tracking.",
        "specs": {
            "processor": "Apple H2 Headphone Chip + U1 in Case",
            "battery": "Up to 6 hours listening on single charge (30 hours with case)",
            "warranty": "1 Year Official Apple Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1018",
        "name": "Sono Playgo 5 Portable Bluetooth Speaker",
        "brand: ": "Sonos",
        "brand": "Sonos",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 158000.0,
        "original_price": 185000.0,
        "discount_percent": 15,
        "stock": 14,
        "rating": 4.9,
        "reviews_count": 78,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
        "tagline": "Room-Filling Stereo Sound | Wi-Fi 6 & Bluetooth 5.3 | 24-Hour Battery Life",
        "description": "High-fidelity portable speaker featuring precision-engineered tweeters, deep bass woofers, automatic Trueplay tuning, and all-weather IP67 durability.",
        "specs": {
            "battery": "24 Hours playback with wireless dock",
            "warranty": "2 Years Official Sonos Warranty"
        },
        "featured": True,
        "best_deal": False
    },

    # 4. WEARABLES, WATCHES & CAMERAS
    {
        "id": "P-1019",
        "name": "Xomia Sport Water Resistance Watch",
        "brand": "Xiaomi",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 42000.0,
        "original_price": 52000.0,
        "discount_percent": 19,
        "stock": 30,
        "rating": 4.8,
        "reviews_count": 110,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        "tagline": "5ATM Water Resistant | 1.43\" AMOLED 60Hz | 12-Day Battery | Dual GPS",
        "description": "Rugged titanium bezel with lightweight fluororubber strap, comprehensive 150+ sports tracking modes, SpO2 blood oxygen monitoring, and ultra-long battery life.",
        "specs": {
            "display": "1.43\" AMOLED 466x466, 600 nits",
            "battery": "470mAh (Up to 12 Days Typical Use)",
            "warranty": "1 Year Official Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1020",
        "name": "Okodo Hero 11+ Black 5.3K Action Camera",
        "brand": "GoPro",
        "category": "Accessories",
        "category_id": "accessories",
        "price": 49000.0,
        "original_price": 65000.0,
        "discount_percent": 25,
        "stock": 20,
        "rating": 4.9,
        "reviews_count": 185,
        "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
        "tagline": "5.3K60 Ultra HD Video | HyperSmooth 5.0 Stabilization | Waterproof to 33ft",
        "description": "Capture cinematic action with high-resolution 27MP photos, 5.3K60 video, dual LCD screens, and Emmy Award-winning HyperSmooth stabilization.",
        "specs": {
            "camera": "27MP Sensor, 5.3K 60fps, 4K 120fps",
            "battery": "1720mAh Enduro Battery",
            "warranty": "1 Year Official GoPro Warranty"
        },
        "featured": True,
        "best_deal": True
    },

    # 5. CHARGERS & KEYBOARDS
    {
        "id": "P-1022",
        "name": "Logitek Bluetooth Mechanical Keyboard",
        "brand": "Logitech",
        "category": "Accessories",
        "category_id": "accessories",
        "price": 36000.0,
        "original_price": 45000.0,
        "discount_percent": 20,
        "stock": 45,
        "rating": 4.8,
        "reviews_count": 175,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "tagline": "Tactile Quiet Mechanical Switches | Multi-Device Easy-Switch | USB-C",
        "description": "Compact wireless mechanical keyboard with low-profile tactile switches, smart illumination backlighting, and fluid multi-OS pairing.",
        "specs": {
            "battery": "Up to 15 days on full charge",
            "warranty": "2 Years Official Logitech Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1023",
        "name": "Anker Prime 240W GaN Desktop Charging Station",
        "brand": "Anker",
        "category": "Accessories",
        "category_id": "accessories",
        "price": 38000.0,
        "original_price": 48000.0,
        "discount_percent": 21,
        "stock": 50,
        "rating": 4.9,
        "reviews_count": 220,
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
        "tagline": "240W Total Output | 4x USB-C Ports | Single Port 140W Max | GaNPrime",
        "description": "Charge 4 devices simultaneously with lightning speed. Delivers 140W max output on a single USB-C port to fast-charge MacBook Pro 16\".",
        "specs": {
            "warranty": "24 Months Anker Official Warranty"
        },
        "featured": False,
        "best_deal": True
    },
    {
        "id": "P-1024",
        "name": "Apple MagSafe Charger 25W Fast Charge (2m)",
        "brand": "Apple",
        "category": "Accessories",
        "category_id": "accessories",
        "price": 13500.0,
        "original_price": 16000.0,
        "discount_percent": 16,
        "stock": 60,
        "rating": 4.9,
        "reviews_count": 310,
        "image_url": "https://images.unsplash.com/photo-1622445262464-84b14e0745b1?w=800&auto=format&fit=crop&q=80",
        "tagline": "Up to 25W Fast Wireless Charging | Braided Cable | Qi2 Certified",
        "description": "The updated MagSafe Charger makes wireless charging a snap. When paired with a 30W adapter, charges iPhone 18 and 17 models up to 50% in 30 mins.",
        "specs": {
            "warranty": "1 Year Apple Mercantile Warranty"
        },
        "featured": False,
        "best_deal": False
    },
    {
        "id": "P-1025",
        "name": "Samsung 45W Super Fast Charger 2.0 (Type-C)",
        "brand": "Samsung",
        "category": "Accessories",
        "category_id": "accessories",
        "price": 8500.0,
        "original_price": 11000.0,
        "discount_percent": 23,
        "stock": 75,
        "rating": 4.8,
        "reviews_count": 410,
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
        "tagline": "PD 3.0 PPS 45W | Includes 5A 1.8m Type-C Cable | Ultra-Compact GaN",
        "description": "Give your Galaxy S26 Ultra, S25 Ultra, and Galaxy Books the powerful charging support they deserve with official Power Delivery 3.0 PPS.",
        "specs": {
            "warranty": "6 Months Official Samsung Warranty"
        },
        "featured": False,
        "best_deal": False
    },
    {
        "id": "P-1011",
        "name": "Apple iPad Pro 13\" M4 (Ultra Retina Tandem OLED)",
        "brand": "Apple",
        "category": "Tablets & Displays",
        "category_id": "tablets",
        "price": 340000.0,
        "original_price": 390000.0,
        "discount_percent": 13,
        "stock": 10,
        "rating": 4.9,
        "reviews_count": 104,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple M4 Chip | Tandem OLED 1000 nits | Apple Pencil Pro Support",
        "description": "The thinnest Apple product ever made at just 5.1mm. Features groundbreaking Tandem OLED display technology and M4 silicon power.",
        "specs": {
            "processor": "Apple M4 Chip (9-core CPU, 10-core GPU, 38 TOPS Neural Engine)",
            "ram": "8GB Unified Memory",
            "storage": "256GB SSD",
            "display": "13.0\" Ultra Retina XDR Tandem OLED, ProMotion 120Hz",
            "battery": "38.99Wh (Up to 10 hours web/video)",
            "warranty": "1 Year Official Apple Warranty"
        },
        "featured": True,
        "best_deal": False
    }
]

def seed_database():
    """Migrates historical CSV data and initializes the database tables."""
    init_db()
    db = SessionLocal()
    
    try:
        logger.info("Starting database seed migration...")
        
        # 1. Seed Categories
        for cat_data in CATEGORIES:
            existing = db.query(Category).filter(Category.id == cat_data["id"]).first()
            if not existing:
                category = Category(**cat_data)
                db.add(category)
        db.commit()
        logger.info("Seeded catalog categories.")
        
        # 2. Seed Mock Users
        for user_data in MOCK_USERS:
            existing = db.query(User).filter(User.id == user_data["id"]).first()
            if not existing:
                user = User(**user_data)
                db.add(user)
            else:
                for k, v in user_data.items():
                    setattr(existing, k, v)
        db.commit()
        logger.info("Seeded demo customer profiles.")
        
        # 3. Seed Flagship Products (insert or update)
        for prod_data in FLAGSHIP_PRODUCTS:
            existing = db.query(Product).filter(Product.id == prod_data["id"]).first()
            if not existing:
                prod = Product(**prod_data)
                db.add(prod)
            else:
                for k, v in prod_data.items():
                    setattr(existing, k, v)
        db.commit()
        logger.info("Seeded 2026 flagship products.")
        
        # 4. Ingest Historical CSV Products if available
        csv_products_path = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"
        if csv_products_path.exists():
            with open(csv_products_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sku = row["sku"]
                    existing = db.query(Product).filter(Product.id == sku).first()
                    if not existing:
                        category_id = "laptops" if "Laptop" in row["category"] else "smartphones" if "Phone" in row["category"] else "audio" if "Audio" in row["category"] else "accessories"
                        prod = Product(
                            id=sku,
                            name=row["name"],
                            brand="NovaCart Official",
                            category=row["category"],
                            category_id=category_id,
                            price=float(row["price_pkr"]),
                            original_price=float(row["price_pkr"]) * 1.1,
                            discount_percent=10,
                            stock=int(row["stock"]),
                            rating=float(row["rating"]),
                            reviews_count=35,
                            image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                            tagline=f"{row['name']} with {row.get('warranty_months', '12')} Months Official Warranty",
                            description=f"Authorized {row['category']} item from NovaCart inventory.",
                            specs={
                                "ram": f"{row.get('ram_gb', '16')}GB" if row.get("ram_gb") else None,
                                "storage": f"{row.get('storage_gb', '512')}GB" if row.get("storage_gb") else None,
                                "warranty": f"{row.get('warranty_months', '12')} Months Official Warranty"
                            }
                        )
                        db.add(prod)
            db.commit()
            logger.info("Ingested legacy products from CSV.")

        # 5. Ingest Historical CSV Orders if available
        csv_orders_path = settings.KNOWLEDGE_BASE_DIR / "data" / "orders.csv"
        if csv_orders_path.exists():
            with open(csv_orders_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    order_id = row["order_id"]
                    existing_order = db.query(Order).filter(Order.id == order_id).first()
                    if not existing_order:
                        cust_id = row["customer_id"]
                        cust = db.query(User).filter(User.id == cust_id).first()
                        if not cust:
                            cust = User(
                                id=cust_id,
                                name=f"Customer {cust_id}",
                                email=f"{cust_id.lower()}@example.pk",
                                phone="+92 300 0000000",
                                address="Islamabad, Pakistan",
                                city="Islamabad"
                            )
                            db.add(cust)
                            db.commit()
                        
                        order = Order(
                            id=order_id,
                            customer_id=cust_id,
                            status=row["status"],
                            total_amount=float(row["total_price"]),
                            shipping_address=cust.address,
                            courier="Leopard Express" if "1" in order_id else "TCS Express",
                            tracking_number=row.get("tracking_number") or f"LP-{order_id.replace('NC-', '')}",
                            expected_delivery=row.get("expected_delivery")
                        )
                        db.add(order)
                        db.commit()
                        
                        item = OrderItem(
                            order_id=order_id,
                            product_id=row["product_sku"],
                            product_name=row["product_name"],
                            quantity=int(row["quantity"]),
                            unit_price=float(row["total_price"]) / max(1, int(row["quantity"])),
                            subtotal=float(row["total_price"]),
                            image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80"
                        )
                        db.add(item)
            db.commit()
            logger.info("Ingested historical orders from CSV.")

        logger.info("Database migration and seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Database seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
