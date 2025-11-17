-- USER:
INSERT INTO USER (role, username, password_hash, phone_number, email, level, xp, travel_coins)
VALUES
    ('ADMIN',   'AdminTest', '$2a$10$dummyhashadmin',  '0744123123', 'admin@test.com', 1, 0, 0),
    ('GUIDE',   'GhidTest', '$2a$10$dummyhashguide',  '0712345678', 'guide@test.com', 3, 500, 0),
    ('TOURIST', 'TuristTest', '$2a$10$dummyhashtour', '0722334455', 'tourist@test.com', 2, 200, 50);