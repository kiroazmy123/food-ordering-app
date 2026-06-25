"""
Run once to create tables and populate sample data:
    python -m app.seed
"""
from .auth import get_password_hash
from .database import Base, SessionLocal, engine
from .models import Category, Product, User, UserRole

Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # --- Admin user ---
        admin = User(
            name="Admin",
            email="admin@food.app",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
        )
        db.add(admin)

        # --- Demo customer ---
        customer = User(
            name="Test Customer",
            email="customer@food.app",
            hashed_password=get_password_hash("customer123"),
            role=UserRole.customer,
        )
        db.add(customer)

        # --- Categories ---
        starters = Category(name_en="Starters", name_ar="مقبلات")
        mains = Category(name_en="Main Course", name_ar="أطباق رئيسية")
        drinks = Category(name_en="Drinks", name_ar="مشروبات")
        desserts = Category(name_en="Desserts", name_ar="حلويات")
        db.add_all([starters, mains, drinks, desserts])
        db.flush()  # get IDs without full commit

        products = [
            Product(
                name_en="Hummus with Pita",
                name_ar="حمص بالخبز",
                description_en="Creamy chickpea dip served with warm pita bread",
                description_ar="حمص كريمي يقدم مع خبز عربي ساخن",
                price=45.0,
                image_url="https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400",
                category_id=starters.id,
            ),
            Product(
                name_en="Stuffed Vine Leaves",
                name_ar="ورق عنب",
                description_en="Rice-stuffed grape leaves, served chilled",
                description_ar="ورق عنب محشي بالأرز، يقدم بارداً",
                price=55.0,
                image_url="https://images.unsplash.com/photo-1623653369392-2549a8ed4d4d?w=400",
                category_id=starters.id,
            ),
            Product(
                name_en="Grilled Chicken Shawarma",
                name_ar="شاورما دجاج مشوي",
                description_en="Marinated grilled chicken wrapped with garlic sauce",
                description_ar="دجاج مشوي متبل ملفوف بصوص الثوم",
                price=95.0,
                image_url="https://images.unsplash.com/photo-1633896949673-2c2c8407e9e5?w=400",
                category_id=mains.id,
            ),
            Product(
                name_en="Koshari",
                name_ar="كشري",
                description_en="Classic Egyptian rice, lentils, pasta and tomato sauce",
                description_ar="كشري مصري كلاسيكي بالأرز والعدس والمكرونة وصلصة الطماطم",
                price=60.0,
                image_url="https://images.unsplash.com/photo-1644112680886-c5f7a0301b41?w=400",
                category_id=mains.id,
            ),
            Product(
                name_en="Grilled Beef Kofta",
                name_ar="كفتة لحم مشوية",
                description_en="Seasoned grilled minced beef skewers with rice",
                description_ar="أسياخ كفتة لحم مشوية متبلة تقدم مع الأرز",
                price=130.0,
                image_url="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400",
                category_id=mains.id,
            ),
            Product(
                name_en="Fresh Lemon Mint",
                name_ar="ليمون بالنعناع",
                description_en="Refreshing lemonade with mint",
                description_ar="عصير ليمون منعش بالنعناع",
                price=30.0,
                image_url="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
                category_id=drinks.id,
            ),
            Product(
                name_en="Mango Juice",
                name_ar="عصير مانجو",
                description_en="Fresh seasonal mango juice",
                description_ar="عصير مانجو طبيعي طازج",
                price=35.0,
                image_url="https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400",
                category_id=drinks.id,
            ),
            Product(
                name_en="Umm Ali",
                name_ar="أم علي",
                description_en="Traditional Egyptian bread pudding with nuts",
                description_ar="حلوى أم علي التقليدية بالمكسرات",
                price=50.0,
                image_url="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
                category_id=desserts.id,
            ),
            Product(
                name_en="Basbousa",
                name_ar="بسبوسة",
                description_en="Sweet semolina cake soaked in syrup",
                description_ar="كيك السميد المحلى بالقطر",
                price=40.0,
                image_url="https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400",
                category_id=desserts.id,
            ),
        ]
        db.add_all(products)

        db.commit()
        print("Seed complete.")
        print("Admin login:    admin@food.app / admin123")
        print("Customer login: customer@food.app / customer123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
