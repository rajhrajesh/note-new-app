-- CREATE TABLE IF NOT EXISTS users (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   username TEXT NOT NULL UNIQUE,
--   name TEXT,
--   password TEXT NOT NULL,
--   gender TEXT,
--   location TEXT
-- );

-- CREATE TABLE IF NOT EXISTS notes (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   username TEXT NOT NULL,
--   title TEXT,
--   content TEXT,
--   tags TEXT,
--   backgroundColor TEXT,
--   archived INTEGER DEFAULT 0,
--   trashed INTEGER DEFAULT 0,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (username) REFERENCES users(username)
-- );

INSERT INTO notes (username, title, content, tags, backgroundColor) VALUES
('john_doe', 'Buy clothes', 'Need to buy new clothes for the upcoming event.', 'shopping', 'yellow'),
('john_doe', 'Buy chocolate', 'Get some chocolates for the weekend.', 'shopping', 'red'),
('jane_doe', 'Grocery Shopping', 'List of items: milk, bread, eggs, and cheese.', 'errands', 'green'),
('michael_smith', 'Meeting Notes', 'Summary of the meeting held on July 10.', 'work', 'blue'),
('emily_jones', 'Birthday Gift', 'Ideas for birthday gift: book, perfume, and wallet.', 'personal', 'purple'),
('robert_brown', 'Workout Routine', 'Plan for the week: cardio on Mon/Wed/Fri, strength on Tue/Thu.', 'fitness', 'orange'),
('linda_white', 'Project Deadline', 'Finish the project report by July 20.', 'work', 'pink'),
('william_taylor', 'Holiday Plan', 'Itinerary for the trip to Hawaii.', 'travel', 'cyan'),
('barbara_wilson', 'Recipe Notes', 'Ingredients and steps for making lasagna.', 'cooking', 'yellow'),
('david_johnson', 'Book List', 'Books to read: "1984", "Brave New World", "Fahrenheit 451".', 'reading', 'brown');

INSERT INTO users (username, name, password, gender, location) VALUES
('john_doe', 'John Doe', 'password123', 'Male', 'New York'),
('jane_doe', 'Jane Doe', 'password123', 'Female', 'Los Angeles'),
('michael_smith', 'Michael Smith', 'password123', 'Male', 'Chicago'),
('emily_jones', 'Emily Jones', 'password123', 'Female', 'Houston'),
('robert_brown', 'Robert Brown', 'password123', 'Male', 'Phoenix'),
('linda_white', 'Linda White', 'password123', 'Female', 'Philadelphia'),
('william_taylor', 'William Taylor', 'password123', 'Male', 'San Antonio'),
('barbara_wilson', 'Barbara Wilson', 'password123', 'Female', 'San Diego'),
('david_johnson', 'David Johnson', 'password123', 'Male', 'Dallas'),
('mary_clark', 'Mary Clark', 'password123', 'Female', 'San Jose');
