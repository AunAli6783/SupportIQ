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

# 2024-2026 Flagship Hardware Catalog
FLAGSHIP_PRODUCTS = [
    {
        "id": "P-1002",
        "name": "Samsung Galaxy S25 Ultra 5G (Galaxy AI)",
        "brand": "Samsung",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 395000.0,
        "original_price": 460000.0,
        "discount_percent": 14,
        "stock": 14,
        "rating": 4.9,
        "reviews_count": 142,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
        "tagline": "Snapdragon 8 Elite | 200MP Quad Telephoto | Built-in S-Pen | Titanium Silver",
        "description": "The definitive 2025/2026 Android flagship with real-time Galaxy AI translation, 200MP camera, 5000mAh battery, and Corning Gorilla Armor anti-reflective display.",
        "specs": {
            "processor": "Qualcomm Snapdragon 8 Elite (3nm)",
            "ram": "16GB LPDDR5X",
            "storage": "512GB UFS 4.0",
            "display": "6.9\" Dynamic AMOLED 2X, 120Hz, 3000 nits",
            "battery": "5000 mAh with 45W Fast Charging",
            "camera": "200MP Main + 50MP 5x Periscope + 50MP 3x + 50MP Ultra-Wide",
            "os": "Android 15 with One UI 7.0 (7 Years OS Updates)",
            "warranty": "1 Year Official Samsung Pakistan Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1005",
        "name": "Apple iPhone 16 Pro Max (Desert Titanium)",
        "brand": "Apple",
        "category": "Smartphones",
        "category_id": "smartphones",
        "price": 490000.0,
        "original_price": 540000.0,
        "discount_percent": 9,
        "stock": 9,
        "rating": 5.0,
        "reviews_count": 98,
        "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
        "tagline": "Apple A18 Pro | Dedicated Camera Control | Apple Intelligence | 4K 120fps Dolby Vision",
        "description": "Engineered for Apple Intelligence with grade 5 titanium design, thinner borders, 48MP Fusion camera, and industry-leading battery life.",
        "specs": {
            "processor": "Apple A18 Pro Bionic (2nd-gen 3nm)",
            "ram": "8GB Unified Memory",
            "storage": "512GB NVMe",
            "display": "6.9\" Super Retina XDR OLED, ProMotion 120Hz",
            "battery": "Up to 33 hours video playback",
            "camera": "48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto",
            "os": "iOS 18.2 with Apple Intelligence",
            "warranty": "1 Year AppleCare Official International Warranty"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1001",
        "name": "Apple MacBook Pro 16\" (M3 Max Silicon)",
        "brand": "Apple",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 485000.0,
        "original_price": 550000.0,
        "discount_percent": 12,
        "stock": 8,
        "rating": 5.0,
        "reviews_count": 87,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "tagline": "M3 Max (16-Core CPU, 40-Core GPU) | 48GB Unified RAM | Liquid Retina XDR | Space Black",
        "description": "Monster performance for software developers, 3D artists, and AI engineers. Up to 22 hours battery life with groundbreaking hardware-accelerated ray tracing.",
        "specs": {
            "processor": "Apple M3 Max (16-core CPU, 40-core GPU, 16-core Neural Engine)",
            "ram": "48GB Unified Memory (configurable to 128GB)",
            "storage": "1TB PCIe Gen4 SSD",
            "display": "16.2\" Liquid Retina XDR, 3456x2234, 1600 nits peak HDR",
            "battery": "100Wh Lithium-Polymer, up to 22 hours",
            "os": "macOS Sonoma / Sequoia",
            "warranty": "2 Years Official AppleCare Extended Warranty"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1003",
        "name": "Dell XPS 16 (2025/2026 Core Ultra 7 OLED)",
        "brand": "Dell",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 440000.0,
        "original_price": 510000.0,
        "discount_percent": 14,
        "stock": 6,
        "rating": 4.8,
        "reviews_count": 45,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
        "tagline": "Intel Core Ultra 7 155H | NVIDIA RTX 4070 | 4K OLED InfinityEdge | Platinum Silver",
        "description": "Seamless glass touchpad, capacitive touch function keys, and Intel NPU dedicated AI acceleration for local machine learning workflows.",
        "specs": {
            "processor": "Intel Core Ultra 7 155H (16 cores, 22 threads, Intel AI Boost NPU)",
            "ram": "32GB LPDDR5x 7467MHz Dual Channel",
            "storage": "1TB M.2 PCIe NVMe SSD",
            "display": "16.3\" 4K+ (3840 x 2400) OLED InfinityEdge Touch, 100% DCI-P3",
            "battery": "99.5Wh with 130W Type-C adapter",
            "os": "Windows 11 Pro 64-bit",
            "warranty": "1 Year Dell ProSupport with Onsite Service"
        },
        "featured": True,
        "best_deal": False
    },
    {
        "id": "P-1004",
        "name": "Lenovo Legion Pro 7i Gen 9 AI Gaming",
        "brand": "Lenovo",
        "category": "Laptops",
        "category_id": "laptops",
        "price": 465000.0,
        "original_price": 530000.0,
        "discount_percent": 12,
        "stock": 10,
        "rating": 4.9,
        "reviews_count": 64,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        "tagline": "Intel Core i9-14900HX | RTX 4090 16GB (175W TGP) | 240Hz PureSight Gaming Display",
        "description": "Powered by Lenovo LA-2Q AI chip for real-time FPS boosting, Legion Coldfront vapor chamber cooling, and per-key RGB Legion TrueStrike keyboard.",
        "specs": {
            "processor": "Intel Core i9-14900HX (24 cores, 32 threads, up to 5.8 GHz)",
            "ram": "32GB DDR5 5600MHz",
            "storage": "2TB PCIe 4.0 NVMe M.2 SSD",
            "display": "16\" WQXGA (2560x1600) IPS, 240Hz, 100% DCI-P3, 500 nits, G-Sync",
            "battery": "99.99Wh with Super Rapid Charge (330W Adapter)",
            "os": "Windows 11 Home",
            "warranty": "2 Years Lenovo Premium Care Pakistan"
        },
        "featured": True,
        "best_deal": True
    },
    {
        "id": "P-1008",
        "name": "Sony WH-1000XM5 Wireless Noise-Canceling",
        "brand": "Sony",
        "category": "Audio & Wearables",
        "category_id": "audio",
        "price": 98000.0,
        "original_price": 115000.0,
        "discount_percent": 15,
        "stock": 25,
        "rating": 4.9,
        "reviews_count": 210,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "tagline": "Dual V1/QN1 HD Processors | 8 Microphones | 30h Battery Life | Hi-Res LDAC Audio",
        "description": "Industry-leading active noise cancellation engineered with 8 microphones, precision voice pickup, and ultra-comfortable lightweight synthetic soft fit leather.",
        "specs": {
            "processor": "Sony Integrated Processor V1 + HD Noise Canceling Processor QN1",
            "ram": "On-board DSP",
            "storage": "N/A",
            "display": "N/A",
            "battery": "Up to 30 hours with ANC enabled (3 min charge = 3 hours playback)",
            "os": "Sony Headphones Connect App (iOS & Android)",
            "warranty": "1 Year Official Sony Pakistan Warranty"
        },
        "featured": False,
        "best_deal": True
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
        db.commit()
        logger.info("Seeded demo customer profiles.")
        
        # 3. Seed Flagship Products
        for prod_data in FLAGSHIP_PRODUCTS:
            existing = db.query(Product).filter(Product.id == prod_data["id"]).first()
            if not existing:
                prod = Product(**prod_data)
                db.add(prod)
        db.commit()
        logger.info("Seeded 2024-2026 flagship products.")
        
        # 4. Ingest Historical CSV Products if available
        csv_products_path = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"
        if csv_products_path.exists():
            with open(csv_products_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sku = row["sku"]
                    existing = db.query(Product).filter(Product.id == sku).first()
                    if not existing:
                        category_id = "laptops" if "Laptop" in row["category"] else "smartphones" if "Phone" in row["category"] else "accessories"
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
                        # Ensure customer exists
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
                        
                        # Add Order Item
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

        logger.info("✅ Database migration and seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Database seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
