DROP TABLE IF EXISTS meal_Reservations;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS university_Halls;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS universities;
DROP TABLE IF EXISTS active_chats;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS dietary_requirements;


CREATE TABLE universities (
  university_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  university_Name text NOT NULL,
  university_Domain text NOT NULL
);


CREATE TABLE university_Halls (
  halls_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  halls_Name text NOT NULL,
  university_ID INTEGER NOT NULL,
  FOREIGN KEY (university_ID)
    REFERENCES universities(university_ID)
);


CREATE TABLE users (
  user_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  user_F_Name text NOT NULL,
  user_L_Name text NOT NULL,
  halls_ID INTEGER NOT NULL,
  email text NOT NULL,
  university_ID INTEGER NOT NULL,
  profileImageLocation text,
  FOREIGN KEY (halls_ID)
    REFERENCES university_Halls(halls_ID),
  FOREIGN KEY (university_ID)
    REFERENCES universities(university_ID)

  );

CREATE TABLE meals (
  meal_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_chef_ID INTEGER NOT NULL,
  halls_ID INTEGER NOT NULL,
  meal_Name text NOT NULL,
  meal_Price DECIMAL(4, 2) NOT NULL,
  meal_Quantity INTEGER NOT NULL,
  meal_Description text NOT NULL,
  meal_Available INTEGER NOT NULL,
  meal_Image_Location text NOT NULL,
  serving_start text NOT NULL,
  serving_end text NOT NULL,
  order_start text NOT NULL,
  order_end text NOT NULL,
  meal_status STRING DEFAULT "PREORDER",
  FOREIGN KEY (meal_chef_ID)
    REFERENCES users(user_ID),
  FOREIGN KEY (halls_ID)
    REFERENCES university_Halls(halls_ID)

  );

CREATE TABLE meal_Reservations (
    meal_Reservation_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_ID INTEGER NOT NULL,
    reserve_user_ID INTEGER NOT NULL,
    reservation_Quantity INTEGER NOT NULL,
    FOREIGN KEY (meal_ID)
        REFERENCES meals(meal_ID),
    FOREIGN KEY (reserve_user_ID)
        REFERENCES users(user_ID)
);
CREATE TABLE dietary_requirements (
    requirement_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    dietary_requirement text NOT NULL
);

CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    meal_ID INTEGER NOT NULL,
    review_content text,
    review_rating INTEGER NOT NULL,
    FOREIGN KEY (author_id)
        REFERENCES users(user_ID),
    FOREIGN KEY (meal_ID)
        REFERENCES meals(meal_ID)
);



CREATE TABLE active_chats (
  chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
  person1_id INTEGER NOT NULL,
  person2_id INTEGER NOT NULL,
  interaction_status STRING DEFAULT "PENDING",
  sent_by_user INTEGER NOT NULL,
  conversation_started TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person1_id) REFERENCES users (user_ID),
  FOREIGN KEY (person2_id) REFERENCES users (user_ID),
  FOREIGN KEY (sent_by_user) REFERENCES users (user_ID)
);

CREATE TABLE messages (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER,
  sender_id INTEGER,
  content TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(chat_id) REFERENCES active_chats(chat_id),
  FOREIGN KEY(sender_id) REFERENCES users(user_ID)
);

INSERT INTO universities (university_Name, university_Domain) VALUES
("University of Portsmouth", 'myport.ac.uk');

INSERT INTO university_Halls (halls_Name, university_ID) VALUES
("Rees Hall", 1),
("Catherine House", 1),
("Greetham Street", 1),
("Margaret Rule", 1),
("Harry Law", 1),
("Bateson Hall", 1),
("Rosalind Franklin", 1),
("Trafalgar", 1),
("Burrell House", 1),
("Chaucer House", 1);

INSERT INTO dietary_requirements (dietary_requirement) VALUES
("Peanuts"),
("Fish"),
("Milk"),
("Eggs"),
("Wheat"),
("Soy"),
("Kosher meat"),
("Halal meat"),
("Vegetarian"),
("Vegan");

