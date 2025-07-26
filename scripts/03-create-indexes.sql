-- Create Indexes for Better Performance
CREATE INDEX idx_farmers_email ON farmers(email);
CREATE INDEX idx_farmers_status ON farmers(status);
CREATE INDEX idx_farmers_location ON farmers(location);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_location ON vendors(location);
CREATE INDEX idx_vendors_rating ON vendors(rating);

CREATE INDEX idx_products_farmer_id ON organic_products(farmer_id);
CREATE INDEX idx_products_category ON organic_products(category);
CREATE INDEX idx_products_status ON organic_products(status);
CREATE INDEX idx_products_created_date ON organic_products(created_date);

CREATE INDEX idx_banners_active ON banners(is_active);
CREATE INDEX idx_banners_created_date ON banners(created_date);

CREATE INDEX idx_news_status ON news_articles(status);
CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_featured ON news_articles(featured);
CREATE INDEX idx_news_publish_date ON news_articles(publish_date);

CREATE INDEX idx_purchases_vendor_id ON vendor_purchases(vendor_id);
CREATE INDEX idx_purchases_product_id ON vendor_purchases(product_id);
CREATE INDEX idx_purchases_farmer_id ON vendor_purchases(farmer_id);
CREATE INDEX idx_purchases_date ON vendor_purchases(purchase_date);
CREATE INDEX idx_purchases_status ON vendor_purchases(status);

CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_vendor_id ON product_reviews(vendor_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
