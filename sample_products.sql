-- Önce kategorileri ekleyelim (eğer yoksa)
INSERT INTO categories (category_name, business_id, sira_id) VALUES
('Ana Yemekler', 1, 1),
('İçecekler', 1, 2),
('Tatlılar', 1, 3),
('Salatalar', 1, 4),
('Fast Food', 1, 5)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- Şimdi 5 farklı ürün ekleyelim
INSERT INTO products (product_name, price, category_id, business_id, is_selected, is_available, sira_id, description, calorie_count, cooking_time, stock) VALUES
-- Ana Yemekler kategorisi
('Tavuk Sote', 45.00, (SELECT category_id FROM categories WHERE category_name = 'Ana Yemekler' AND business_id = 1 LIMIT 1), 1, true, true, 1, 'Özel soslu tavuk sote, pilav ile servis edilir', 350, 25, 50),

-- İçecekler kategorisi  
('Ayran', 8.00, (SELECT category_id FROM categories WHERE category_name = 'İçecekler' AND business_id = 1 LIMIT 1), 1, true, true, 2, 'Taze günlük ayran', 120, 0, 100),

-- Tatlılar kategorisi
('Künefe', 25.00, (SELECT category_id FROM categories WHERE category_name = 'Tatlılar' AND business_id = 1 LIMIT 1), 1, true, true, 3, 'Antep fıstıklı künefe, dondurma ile servis edilir', 450, 15, 30),

-- Salatalar kategorisi
('Sezar Salata', 35.00, (SELECT category_id FROM categories WHERE category_name = 'Salatalar' AND business_id = 1 LIMIT 1), 1, true, true, 4, 'Marul, tavuk, parmesan peyniri, kruton ile', 280, 10, 25),

-- Fast Food kategorisi
('Hamburger', 40.00, (SELECT category_id FROM categories WHERE category_name = 'Fast Food' AND business_id = 1 LIMIT 1), 1, true, true, 5, 'Dana eti, marul, domates, soğan, özel sos ile', 550, 12, 40);

-- Eğer category_id bulunamazsa, sabit ID'ler kullanabiliriz
-- Bu durumda aşağıdaki scripti kullanın:

/*
INSERT INTO products (product_name, price, category_id, business_id, is_selected, is_available, sira_id, description, calorie_count, cooking_time, stock) VALUES
('Tavuk Sote', 45.00, 1, 1, true, true, 1, 'Özel soslu tavuk sote, pilav ile servis edilir', 350, 25, 50),
('Ayran', 8.00, 2, 1, true, true, 2, 'Taze günlük ayran', 120, 0, 100),
('Künefe', 25.00, 3, 1, true, true, 3, 'Antep fıstıklı künefe, dondurma ile servis edilir', 450, 15, 30),
('Sezar Salata', 35.00, 4, 1, true, true, 4, 'Marul, tavuk, parmesan peyniri, kruton ile', 280, 10, 25),
('Hamburger', 40.00, 5, 1, true, true, 5, 'Dana eti, marul, domates, soğan, özel sos ile', 550, 12, 40);
*/ 