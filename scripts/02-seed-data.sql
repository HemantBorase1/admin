-- Insert Admin Users
INSERT INTO admin_users (name, email, password) VALUES
('Admin User', 'admin@agripanel.com', '$2b$10$hash_for_admin123'),
('Super Admin', 'superadmin@agripanel.com', '$2b$10$hash_for_super123');

-- Insert Farmers
INSERT INTO farmers (name, email, phone, aadhar, experience, status, location, join_date, avatar) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+91 9876543210', '1234-5678-9012', 'Experienced', 'Verified', 'Punjab', '2024-01-15', '/placeholder.svg?height=32&width=32'),
('Priya Sharma', 'priya@example.com', '+91 9876543211', '2345-6789-0123', 'Fresher', 'Pending', 'Haryana', '2024-02-20', '/placeholder.svg?height=32&width=32'),
('Amit Patel', 'amit@example.com', '+91 9876543212', '3456-7890-1234', 'Experienced', 'Verified', 'Gujarat', '2024-01-10', '/placeholder.svg?height=32&width=32'),
('Sunita Devi', 'sunita@example.com', '+91 9876543213', '4567-8901-2345', 'Fresher', 'Rejected', 'Bihar', '2024-03-05', '/placeholder.svg?height=32&width=32'),
('Mohan Singh', 'mohan@example.com', '+91 9876543214', '5678-9012-3456', 'Experienced', 'Verified', 'Uttar Pradesh', '2024-01-20', '/placeholder.svg?height=32&width=32');

-- Insert Farmer Crops
INSERT INTO farmer_crops (farmer_id, crop_name) VALUES
(1, 'Wheat'), (1, 'Rice'),
(2, 'Corn'), (2, 'Sugarcane'),
(3, 'Cotton'), (3, 'Groundnut'),
(4, 'Rice'), (4, 'Wheat'),
(5, 'Barley'), (5, 'Mustard');

-- Insert Vendors (Buyers)
INSERT INTO vendors (name, location, category, rating, total_purchases, join_date, last_purchase, avatar) VALUES
('Green Market Co.', 'Delhi', 'Grains', 4.5, 25, '2024-01-15', '2024-03-10', '/placeholder.svg?height=32&width=32'),
('Fresh Produce Ltd.', 'Mumbai', 'Vegetables', 4.2, 18, '2024-02-20', '2024-03-08', '/placeholder.svg?height=32&width=32'),
('Organic Solutions', 'Pune', 'Dairy & Other Products', 4.8, 12, '2024-01-10', '2024-03-05', '/placeholder.svg?height=32&width=32'),
('Healthy Foods India', 'Bangalore', 'Vegetables', 4.1, 35, '2024-03-05', '2024-03-12', '/placeholder.svg?height=32&width=32'),
('Dairy Fresh Corp', 'Chennai', 'Dairy & Other Products', 4.6, 22, '2024-02-01', '2024-03-11', '/placeholder.svg?height=32&width=32'),
('Grain Masters', 'Kolkata', 'Grains', 4.3, 28, '2024-01-25', '2024-03-09', '/placeholder.svg?height=32&width=32'),
('Veggie World', 'Hyderabad', 'Vegetables', 4.7, 31, '2024-02-15', '2024-03-13', '/placeholder.svg?height=32&width=32');

-- Insert Organic Products
INSERT INTO organic_products (farmer_id, name, description, category, price, unit, quantity, harvest_date, expiry_date, status, image_url, rating, reviews_count, created_date) VALUES
(1, 'Organic Tomatoes', 'Fresh organic tomatoes grown without pesticides', 'Vegetables', 80.00, 'per kg', 50, '2024-03-10', '2024-03-20', 'Available', '/placeholder.svg?height=200&width=200', 4.5, 23, '2024-03-10'),
(3, 'Organic Wheat Flour', 'Stone ground organic wheat flour from traditional varieties', 'Grains', 45.00, 'per kg', 100, '2024-02-15', '2024-08-15', 'Available', '/placeholder.svg?height=200&width=200', 4.8, 45, '2024-02-20'),
(2, 'Organic Spinach', 'Fresh leafy organic spinach rich in iron and vitamins', 'Vegetables', 60.00, 'per kg', 25, '2024-03-12', '2024-03-17', 'Low Stock', '/placeholder.svg?height=200&width=200', 4.3, 18, '2024-03-12'),
(1, 'Organic Basmati Rice', 'Premium organic basmati rice with authentic aroma', 'Grains', 120.00, 'per kg', 0, '2024-01-20', '2025-01-20', 'Out of Stock', '/placeholder.svg?height=200&width=200', 4.7, 67, '2024-01-25'),
(4, 'Organic Honey', 'Pure organic honey from wildflower nectar', 'Dairy & Others', 350.00, 'per 500g', 30, '2024-02-01', '2026-02-01', 'Available', '/placeholder.svg?height=200&width=200', 4.9, 34, '2024-02-05'),
(5, 'Organic Mustard Oil', 'Cold-pressed organic mustard oil', 'Dairy & Others', 180.00, 'per liter', 40, '2024-02-10', '2025-02-10', 'Available', '/placeholder.svg?height=200&width=200', 4.4, 28, '2024-02-15'),
(3, 'Organic Chickpeas', 'Premium quality organic chickpeas', 'Grains', 90.00, 'per kg', 60, '2024-01-30', '2025-01-30', 'Available', '/placeholder.svg?height=200&width=200', 4.6, 41, '2024-02-05'),
(2, 'Organic Carrots', 'Fresh organic carrots rich in beta-carotene', 'Vegetables', 70.00, 'per kg', 35, '2024-03-08', '2024-03-22', 'Available', '/placeholder.svg?height=200&width=200', 4.2, 19, '2024-03-08');

-- Insert Banners
INSERT INTO banners (title, description, image_url, is_active, click_count, created_date) VALUES
('Summer Crop Protection', 'Protect your crops from summer heat with our premium solutions', '/placeholder.svg?height=200&width=400', TRUE, 1250, '2024-03-15'),
('Organic Fertilizer Sale', 'Get 20% off on all organic fertilizers this month', '/placeholder.svg?height=200&width=400', TRUE, 890, '2024-03-10'),
('New Seed Varieties', 'Discover high-yield seed varieties for better harvest', '/placeholder.svg?height=200&width=400', FALSE, 456, '2024-03-05'),
('Farming Equipment Expo', 'Join us at the biggest farming equipment exhibition', '/placeholder.svg?height=200&width=400', TRUE, 2100, '2024-02-28'),
('Monsoon Preparation', 'Get ready for monsoon season with our expert guidance', '/placeholder.svg?height=200&width=400', TRUE, 1680, '2024-03-01'),
('Organic Certification', 'Get your products certified organic with our help', '/placeholder.svg?height=200&width=400', FALSE, 720, '2024-02-25');

-- Insert News Articles
INSERT INTO news_articles (title, content, source, source_url, category, status, featured, views, publish_date) VALUES
('New Agricultural Subsidy Scheme Launched', 'The government has announced a new subsidy scheme for small and marginal farmers to promote sustainable farming practices. The scheme offers financial assistance for organic farming equipment and training.', 'Ministry of Agriculture', 'https://agriculture.gov.in', 'Government Scheme', 'Published', TRUE, 1250, '2024-03-15'),
('Weather Alert: Heavy Rainfall Expected', 'Meteorological department has issued a weather alert for heavy rainfall in northern states. Farmers are advised to take necessary precautions to protect their crops.', 'India Meteorological Department', 'https://mausam.imd.gov.in', 'Weather Alert', 'Published', FALSE, 890, '2024-03-14'),
('Organic Farming Training Program', 'A comprehensive training program on organic farming techniques will be conducted across rural areas. Registration is now open for interested farmers.', 'Agricultural Extension Department', 'https://extension.gov.in', 'Training', 'Draft', FALSE, 456, '2024-03-13'),
('Crop Insurance Claim Process Simplified', 'The crop insurance claim process has been digitized and simplified. Farmers can now submit claims online through the official portal.', 'Crop Insurance Company', 'https://pmfby.gov.in', 'Insurance', 'Published', TRUE, 2100, '2024-03-12'),
('Digital Agriculture Initiative', 'Government launches digital agriculture platform to connect farmers with markets and provide real-time crop prices.', 'Ministry of Agriculture', 'https://agriculture.gov.in', 'Government Scheme', 'Published', FALSE, 1580, '2024-03-11'),
('Pest Control Workshop', 'Free workshop on integrated pest management techniques for sustainable farming practices.', 'Agricultural University', 'https://agri-university.edu.in', 'Training', 'Published', FALSE, 650, '2024-03-10');

-- Insert Vendor Purchases
INSERT INTO vendor_purchases (vendor_id, product_id, farmer_id, quantity, price_per_unit, total_amount, purchase_date, status) VALUES
(1, 2, 3, 50, 45.00, 2250.00, '2024-03-10', 'Completed'),
(1, 4, 1, 30, 120.00, 3600.00, '2024-03-08', 'Completed'),
(2, 1, 1, 25, 80.00, 2000.00, '2024-03-08', 'Completed'),
(2, 3, 2, 15, 60.00, 900.00, '2024-03-07', 'Completed'),
(3, 5, 4, 10, 350.00, 3500.00, '2024-03-05', 'Completed'),
(4, 8, 2, 20, 70.00, 1400.00, '2024-03-12', 'Completed'),
(5, 6, 5, 5, 180.00, 900.00, '2024-03-11', 'Completed'),
(6, 7, 3, 40, 90.00, 3600.00, '2024-03-09', 'Completed'),
(7, 1, 1, 30, 80.00, 2400.00, '2024-03-13', 'Pending');

-- Insert Product Reviews
INSERT INTO product_reviews (product_id, vendor_id, rating, review_text) VALUES
(1, 2, 5, 'Excellent quality tomatoes, very fresh and organic taste'),
(2, 1, 5, 'Best wheat flour I have purchased, great for making bread'),
(3, 4, 4, 'Good quality spinach, fresh and green'),
(5, 3, 5, 'Pure honey, excellent taste and quality'),
(6, 5, 4, 'Good mustard oil, authentic taste'),
(7, 6, 5, 'Premium quality chickpeas, well cleaned'),
(8, 4, 4, 'Fresh carrots, good for cooking'),
(1, 4, 4, 'Good tomatoes, will order again');
