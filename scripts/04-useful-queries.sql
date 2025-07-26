-- Useful Queries for Your Admin Panel

-- 1. Get Dashboard Statistics
SELECT 
    (SELECT COUNT(*) FROM farmers WHERE status = 'Verified') as total_farmers,
    (SELECT COUNT(*) FROM vendors) as total_vendors,
    (SELECT COUNT(*) FROM organic_products WHERE quantity > 0) as available_products,
    (SELECT COUNT(*) FROM news_articles WHERE status = 'Published') as published_news;

-- 2. Get Monthly Growth Data
SELECT 
    DATE_FORMAT(join_date, '%Y-%m') as month,
    COUNT(*) as farmers_joined
FROM farmers 
WHERE join_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(join_date, '%Y-%m')
ORDER BY month;

-- 3. Get Top Rated Products
SELECT 
    p.name,
    p.rating,
    p.reviews_count,
    f.name as farmer_name,
    p.category
FROM organic_products p
JOIN farmers f ON p.farmer_id = f.id
WHERE p.rating >= 4.0
ORDER BY p.rating DESC, p.reviews_count DESC
LIMIT 10;

-- 4. Get Vendor Purchase Summary
SELECT 
    v.name as vendor_name,
    v.category,
    COUNT(vp.id) as total_orders,
    SUM(vp.total_amount) as total_spent,
    AVG(vp.total_amount) as avg_order_value
FROM vendors v
LEFT JOIN vendor_purchases vp ON v.id = vp.vendor_id
WHERE vp.status = 'Completed'
GROUP BY v.id, v.name, v.category
ORDER BY total_spent DESC;

-- 5. Get Low Stock Products
SELECT 
    p.name,
    p.quantity,
    p.category,
    f.name as farmer_name,
    f.phone as farmer_phone
FROM organic_products p
JOIN farmers f ON p.farmer_id = f.id
WHERE p.quantity < 30 AND p.quantity > 0
ORDER BY p.quantity ASC;

-- 6. Get Most Active Farmers
SELECT 
    f.name,
    f.location,
    COUNT(p.id) as products_listed,
    AVG(p.rating) as avg_product_rating,
    SUM(CASE WHEN p.quantity > 0 THEN 1 ELSE 0 END) as available_products
FROM farmers f
LEFT JOIN organic_products p ON f.id = p.farmer_id
WHERE f.status = 'Verified'
GROUP BY f.id, f.name, f.location
HAVING products_listed > 0
ORDER BY products_listed DESC, avg_product_rating DESC;

-- 7. Get News Article Performance
SELECT 
    title,
    category,
    views,
    publish_date,
    CASE WHEN featured = 1 THEN 'Yes' ELSE 'No' END as is_featured
FROM news_articles
WHERE status = 'Published'
ORDER BY views DESC
LIMIT 10;

-- 8. Get Banner Click Performance
SELECT 
    title,
    click_count,
    created_date,
    CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
FROM banners
ORDER BY click_count DESC;
