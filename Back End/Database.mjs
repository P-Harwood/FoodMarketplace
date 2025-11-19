import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';


/*
initiliazes the database (name specified under filename:)
migration paths are added
*/
async function init() {

    const db = await sqlite.open({
        filename: './Database.sqlite',
        driver: sqlite3.Database,
        verbose: true
    });
    await db.migrate({migrationsPath: './migrations-sqlite'});
    return db;
}

const dbConn = init();


export async function addListing(listingDetails) {
    const db = await dbConn;
    return db.run(`
            INSERT INTO meals (
                meal_chef_ID, halls_ID, meal_Name, meal_Price, meal_Quantity,
                meal_Description, meal_Available, meal_Image_Location,
                serving_start, serving_end, order_start, order_end
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);
        `, [
        listingDetails.user_ID, listingDetails.halls_ID, listingDetails.meal_Name,
        listingDetails.meal_Price, listingDetails.meal_Quantity, listingDetails.meal_Description,
        listingDetails.meal_Quantity, listingDetails.meal_Image_Location,
        listingDetails.serving_start, listingDetails.serving_end,
        listingDetails.order_start, listingDetails.order_end
    ]);
}


export async function getPopular(hall_ID) {
    const db = await dbConn;
    // Use proper JOIN syntax
    return db.all(`SELECT * FROM meals 
                  JOIN meals ON meal_Reservations.meal_ID = meals.meal_ID 
                  WHERE meal_Reservations.reserve_user_ID = ${user_ID};`);
}

export async function reservationRetrieve(user_ID) {
    const db = await dbConn;
    // Use proper JOIN syntax
    return db.all(`SELECT * FROM meal_Reservations 
                  JOIN meals ON meal_Reservations.meal_ID = meals.meal_ID 
                  WHERE meal_Reservations.reserve_user_ID = ${user_ID};`);
}


export async function deleteReservation(reservationID){
    const db = await dbConn
    return db.run(`DELETE FROM meal_Reservations WHERE meal_Reservation_ID = (?);`, [reservationID]);
}


export async function reserveMeal(reservationDetails){
    const db = await dbConn
    return db.run(`INSERT INTO meal_Reservations (meal_ID, reserve_user_ID, reservation_Quantity) VALUES (?,?,?);`,
        [reservationDetails["meals_ID"],reservationDetails["user_ID"], reservationDetails["reservation_Quantity"]]);
}

export async function getMealAvailable(mealID){
    const db = await dbConn
    return db.get(`SELECT meal_Available FROM meals WHERE meal_ID = ?;`, [mealID]);
}

export async function getReviews(user_id){
    const db = await dbConn
    return db.get(`SELECT * FROM reviews WHERE target_id = ?;`, [user_id]);
}

export async function setMealAvailable(reservation_Quantity, mealID){
    const db = await dbConn
    return db.run(`UPDATE meals SET meal_Available = ? WHERE meal_ID = ?;`, [reservation_Quantity, mealID]);
}


export async function getUserDetails(user_ID){
    const db = await dbConn
    return db.get(`SELECT * FROM users WHERE user_id = ?;`,
        [user_ID]);
}


export async function createUser(firstName, lastName, hallsID, email){
    const db = await dbConn
    return db.run(`INSERT INTO users (user_F_Name, user_L_Name, halls_ID, email, university_ID) VALUES (?,?,?,?,1);`,
        [firstName, lastName, hallsID, email]);
}

export async function findHall(hallName){
    const db = await dbConn
    return db.get(`SELECT * FROM university_Halls WHERE halls_Name = ?;`, [hallName]);
}


export async function findHallID(hallID){
    const db = await dbConn
    return db.get(`SELECT * FROM university_Halls WHERE halls_ID = ?;`, [hallID]);
}

export async function getMealDetails(mealID){
    const db = await dbConn
    return db.get(`SELECT * FROM meals WHERE meal_ID = ?;`, [mealID]);
}



export async function retrieveMealImage(meal_ID){
    const db = await dbConn
    return db.get(`SELECT * FROM meals WHERE meal_ID = ?;`, [meal_ID]);
}

export async function getAllMeals(){
    const db = await dbConn
    return db.all(`SELECT * FROM meals;`);
}



export async function deleteListing(meal_ID){
    const db = await dbConn
    return db.run('UPDATE meals SET meal_status = "CANCELLED" WHERE meal_ID = ?;',
        [meal_ID]);
}


export async function editListing(listingDetails) {
    const db = await dbConn;
    return db.run('UPDATE meals SET meal_Name = ?, meal_Price = ?, meal_Available = ?, meal_Description = ? WHERE meal_ID = ?',
        [listingDetails.meal_Name, listingDetails.meal_Price, listingDetails.meal_Available, listingDetails.meal_Description, listingDetails.meal_ID]);
}

export async function updateMealStatus(meal_ID, status) {
    const db = await dbConn;
    return db.run('UPDATE meals SET meal_status = ? WHERE meal_ID = ?',
        [status, meal_ID]);
}






export async function getReservations(user_ID) {
    const db = await dbConn;
    return db.all(`SELECT * 
                        FROM meal_Reservations 
                        JOIN meals ON meal_reservations.meal_ID = meals.meal_ID
                        WHERE meal_reservations.reserve_user_ID = ?;`, [user_ID]);
}
export async function getReservationsByMealID(meal_ID) {
    const db = await dbConn;
    return db.all(`SELECT * 
                        FROM meal_Reservations 
                        JOIN users ON meal_reservations.meal_chef_ID = users.user_ID
                        WHERE meal_reservations.meal_ID = ?;`, [meal_ID]);
}



export async function checkEmail(emailAddress) {
    const db = await dbConn;
    return db.get(`SELECT * FROM users WHERE email = ?;`, [emailAddress]);
}



export async function viewOwnListing(userID){
    const db = await dbConn;
    //
    return db.all(`SELECT * FROM meals WHERE meal_chef_ID = ${userID};`)
}

export async function viewOwnListingsWithReservations(userID) {
    const db = await dbConn;
    const query = `
        SELECT 
            m.meal_ID,
            m.meal_Name,
            m.meal_Price,
            m.meal_Quantity,
            m.meal_Description,
            m.meal_Available,
            m.meal_Image_Location,
            m.serving_start,
            m.serving_end,
            m.order_start,
            m.order_end,
            m.meal_status,
            u.user_ID,
            u.user_F_Name,
            u.user_L_Name,
            u.halls_ID,
            u.profileImageLocation,
            r.reservation_Quantity
        FROM 
            meals m
        LEFT JOIN 
            meal_Reservations r ON m.meal_ID = r.meal_ID
        LEFT JOIN 
            users u ON r.reserve_user_ID = u.user_ID
        WHERE 
            m.meal_chef_ID = ?
    `;

    const result = await db.all(query, [userID]);

    // Process the raw result to structure it with reservations grouped under each meal
    const meals = result.reduce((acc, row) => {
        if (!acc[row.meal_ID]) {
            acc[row.meal_ID] = {
                meal_ID: row.meal_ID,
                meal_Name: row.meal_Name,
                meal_Price: row.meal_Price,
                meal_Quantity: row.meal_Quantity,
                meal_Description: row.meal_Description,
                meal_Available: row.meal_Available,
                meal_Image_Location: row.meal_Image_Location,
                serving_start: row.serving_start,
                serving_end: row.serving_end,
                order_start: row.order_start,
                order_end: row.order_end,
                meal_status: row.meal_status,
                reservations: []
            };
        }
        if (row.user_ID) { // Check if there is a reservation associated
            acc[row.meal_ID].reservations.push({
                user_ID: row.user_ID,
                user_F_Name: row.user_F_Name,
                halls_ID:row.halls_ID,
                user_L_Name: row.user_L_Name,
                profileImageLocation: row.profileImageLocation,
                reservation_Quantity: row.reservation_Quantity
            });
        }
        return acc;
    }, {});

    // Convert the meals object to an array
    return Object.values(meals);
}
export async function viewAllListings(halls_ID){
    const db = await dbConn;
    return db.all(`SELECT * FROM meals WHERE halls_ID = ${halls_ID};`)
}

export async function returnOrderableMeals(halls_ID){
    const db = await dbConn;

    return db.all(`SELECT * FROM meals WHERE halls_ID  = ${halls_ID} AND meal_status = "ORDER";`)
}


export async function getConversations(user_ID) {
    const db = await dbConn; // Make sure dbConn is correctly initialized to connect to your database
    const query = `
        SELECT 
            ac.chat_id, 
            ac.person1_id, 
            user1.user_F_Name AS person1_firstname, 
            user1.user_L_Name AS person1_lastname,
            ac.person2_id, 
            user2.user_F_Name AS person2_firstname, 
            user2.user_L_Name AS person2_lastname
        FROM 
            active_chats ac
            JOIN users AS user1 ON ac.person1_id = user1.user_ID 
            JOIN users AS user2 ON ac.person2_id = user2.user_ID 
        WHERE 
            ac.person1_id = ? OR ac.person2_id = ?
    `;

    // Use parameterized query to prevent SQL injection
    return db.all(query, [user_ID, user_ID]);
}

export async function getConversationID(user_one_ID, user_two_ID) {
    const db = await dbConn; // Make sure dbConn is correctly initialized to connect to your database
    const query = `
        SELECT 
            ac.chat_id, 
            ac.person1_id, 
            user1.user_F_Name AS person1_firstname, 
            user1.user_L_Name AS person1_lastname,
            ac.person2_id, 
            user2.user_F_Name AS person2_firstname, 
            user2.user_L_Name AS person2_lastname
        FROM 
            active_chats ac
            JOIN users AS user1 ON ac.person1_id = user1.user_ID 
            JOIN users AS user2 ON ac.person2_id = user2.user_ID 
        WHERE 
            (ac.person1_id = ? AND ac.person2_id = ?) OR (ac.person1_id = ? AND ac.person2_id = ?)
    `;

    // Use parameterized query to prevent SQL injection
    return db.get(query, [user_one_ID, user_two_ID, user_two_ID, user_one_ID]);
}


export async function checkExistingChat(person1_id, person2_id){
    const db = await dbConn;
    return db.get(`SELECT * FROM active_chats WHERE person1_id = ${person1_id} AND person2_id = ${person2_id};`);
}

export async function createChat(person1_id, person2_id) {
    const db = await dbConn;

    return db.run(`INSERT INTO active_chats (person1_id, person2_id, sent_by_user) VALUES(?,?,?)`
        , [person1_id, person2_id, person1_id]);
}

export async function getMessages(chat_id) {
    const db = await dbConn;
    return db.all(`SELECT * FROM messages WHERE chat_id = ${chat_id};`);
}

export async function getReviewAndMeal(user_ID, meal_ID) {
    const db = await dbConn;
    const review = await db.get(
        `SELECT r.* FROM reviews r 
         INNER JOIN meals m ON r.meal_ID = m.meal_ID
         WHERE r.meal_ID = ? AND r.author_id = ?`,
        [meal_ID, user_ID]
    );
    return review;
}

export async function getReviewsByMealID(meal_ID) {
    const db = await dbConn;
    return db.all(`SELECT * FROM reviews INNER JOIN users ON reviews.author_ID  = users.user_ID WHERE meal_ID = ${meal_ID};`);
}



export async function addReview(reviewDetails) {
    const db = await dbConn;
    return db.run(`INSERT INTO reviews (author_id, meal_ID, review_content, review_rating) VALUES(?,?,?,?)`
        , [reviewDetails.author_id, reviewDetails.meal_ID, reviewDetails.review_content,reviewDetails.review_rating ]);
}


export async function updateReview(review_id, reviewDetails) {
    const db = await dbConn;
    return db.run('UPDATE reviews SET review_content = ?, review_rating = ? WHERE review_id = ?',
        [reviewDetails.review_content, reviewDetails.review_rating, review_id]);
}



export async function sendMessage(messageDetails) {
    const db = await dbConn;

    return db.run(`INSERT INTO messages (chat_id, sender_id, content) VALUES(?,?,?)`
        , [messageDetails["conversationID"], messageDetails["sender_id"], messageDetails["message"]]);
}

export async function checkConversation(chat_id,lastMessageID) {
    const db = await dbConn;
    return db.all(`SELECT * FROM messages WHERE chat_id = ? AND message_id > ?;`, [chat_id,lastMessageID]);
}

export async function uploadProfileImage(user_ID, image_path) {
    const db = await dbConn;
    return db.run('UPDATE users SET profileImageLocation = ? WHERE user_ID = ?',
        [image_path, user_ID]);
}

export async function updateProfileImage(user_ID, image_path) {
    const db = await dbConn;
    return db.run('UPDATE users SET profileImageLocation = ? WHERE user_ID = ?',
        [image_path, user_ID]);
}


//dbConn is what is used to communicate with the Database


