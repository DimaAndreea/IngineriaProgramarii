-- USERS
INSERT INTO users (role, first_name, last_name, password_hash, phone_number, email, level, xp, travel_coins)
VALUES
    ('ADMIN',   'Admin',   'User',   '$2a$10$dummyhashadmin',  '0000000000', 'admin@travelquest.com', 1, 0, 0),
    ('GUIDE',   'Gina',    'Guide',  '$2a$10$dummyhashguide',  '0712345678', 'guide@travelquest.com', 3, 500, 100),
    ('TOURIST', 'Tom',     'Traveler','$2a$10$dummyhashtour', '0722334455', 'tourist@travelquest.com', 2, 200, 50);

-- ITINERARIES
INSERT INTO itinerary (title, description, category, price, status, creator_id)
VALUES
    ('Paris Highlights', 'Tur ghidat în Paris', 'CITY', 300, 'PUBLISHED', 2),
    ('Hidden Rome',      'Itinerar urban în Roma', 'CITY', 250, 'DRAFT', 2);

-- MISSIONS
INSERT INTO mission (itinerary_id, title, description, reward_xp, reward_coins)
VALUES
    (1, 'Poza la Tour Eiffel', 'Încarcă o poză cu Turnul Eiffel', 100, 20),
    (1, 'Degustă un croissant', 'Poză cu un croissant autentic', 50, 10),
    (2, 'Fontana di Trevi', 'Selfie la fântână', 80, 15);

-- REWARDS
INSERT INTO reward (name, description, price, reward_type)
VALUES
    ('Sticker pack', 'Stickere TravelQuest', 50, 'DIGITAL'),
    ('Voucher 10%',  'Voucher reducere 10%', 200, 'DISCOUNT');

-- BADGES
INSERT INTO badge (name, level_required)
VALUES
    ('Beginner Traveler', 1),
    ('Pro Explorer', 3);

-- PARTICIPATION
INSERT INTO participation (user_id, itinerary_id)
VALUES
    (3, 1);

-- USER_BADGE
INSERT INTO user_badge (user_id, badge_id)
VALUES
    (3, 1);

-- PURCHASE
INSERT INTO purchase (user_id, reward_id)
VALUES
    (3, 1);

-- FEEDBACK
INSERT INTO feedback (from_user_id, to_user_id, itinerary_id, rating, comment)
VALUES
    (3, 2, 1, 5, 'Super ghid, super tur!');

-- SUBMISSION
INSERT INTO submission (user_id, mission_id, guide_id, submission_url, status)
VALUES
    (3, 1, 2, 'https://example.com/submission1.jpg', 'PENDING');
