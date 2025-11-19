
import express from "express";
import { Server } from 'socket.io';
import * as API from "./Database.mjs";
import { CronJob } from 'cron';
import http from 'http';

import { fileURLToPath } from 'url';


import { OAuth2Client } from 'google-auth-library';





import fs from "fs";
import multer from "multer";
import bodyParser from 'body-parser';
import path from "path";
import sharp from "sharp";
import {
    addReview,
    checkExistingChat,
    deleteReservation,
    getMealAvailable,
    getMealDetails,
    getReservations, getReservationsByMealID, getReviewAndMeal, getReviewsByMealID,
    viewOwnListing, viewOwnListingsWithReservations
} from "./Database.mjs";








const serverStartCronInit = async () => {
    const allListings = await API.getAllMeals();
    allListings.forEach(individual => {
            addCronTimes(individual);
    })
}






const calculateDelay = (expirationTime) => {
    const currentTime = new Date();
    const delay = expirationTime.getTime() - currentTime.getTime();
    return delay > 0 ? Math.ceil(delay / (1000 * 60)): 0; // converts delay to minutes if the time has not passed, if it has it returns 0 so that the operation can be carried out instantly
}

const updateMealField = async (meal_ID) => {
    try {
        // Logic to update meal fields (e.g., change time_status)

        const listingDetails = await API.getMealDetails(meal_ID);
        if (listingDetails && listingDetails.meal_status !== "CANCELLED"){
            console.log(`Updating meal status ${listingDetails}`);

            const timings = [
                calculateDelay(new Date(listingDetails.order_start)),
                calculateDelay(new Date(listingDetails.order_end)),
                calculateDelay(new Date(listingDetails.serving_start)),
                calculateDelay(new Date(listingDetails.serving_end))
            ];

            let status;
            if (timings[0] !== 0) {
                status = "PREORDER";
            } else if (timings[1] !== 0) {
                status = "ORDER";
            } else if (timings[2] !== 0) {
                status = "PRESERVE";
            } else if (timings[3] !== 0) {
                status = "SERVE";
            } else {
                status = "CLOSED";
            }

            // Update meal status
            await API.updateMealStatus(meal_ID, status);
            console.log(`Meal ${meal_ID} status updated to ${status}`);
        } else{
            console.log("Listing Detail doesnt exist. Status Update not performed.")
        }

    } catch (error) {
        console.error(`Error updating meal ${meal_ID}:`, error);
    }
}

const initCronJob = (timing, meal_ID) => {
    const currentTiming = new Date(timing);
    const currentDelay = calculateDelay(currentTiming);
    console.log(currentDelay);
    if (currentDelay == 0){
        updateMealField(meal_ID).catch(error => console.error(error));
    } else{
        const job = new CronJob(
            `*/${currentDelay} * * * *`, // Cron expression with calculated delay
            () => {
                updateMealField(meal_ID).catch(error => console.error(error));
            },
            null,
            true,
            'UTC' // Use UTC time zone to match the input timestamp
        );
        console.log(`Created Cron Job for Meal: ${meal_ID} in: ${currentDelay}`)
    }

}

const addCronTimes = (listingDetails) => {
    console.log("adding cron time");
    console.log(listingDetails)
    console.log(listingDetails.order_start, listingDetails.order_end, listingDetails.serving_start, listingDetails.serving_end)
    const timings = [listingDetails.order_start, listingDetails.order_end, listingDetails.serving_start, listingDetails.serving_end];

    timings.forEach(timing => {
        initCronJob(timing, listingDetails.meal_ID);
    });
}


const updateCronTimes = async (listingDetails) => {
    const originalDetails = await API.getMealDetails(listingDetails.meal_ID);
    console.log(originalDetails)
    const timing_pairs = [[originalDetails.order_start, listingDetails.order_start],[originalDetails.order_end, listingDetails.order_end],[originalDetails.serving_start, listingDetails.serving_start],[originalDetails.serving_start, listingDetails.serving_start]]

    timing_pairs.forEach(pair => {
        if(pair[0] !== pair[1]){//if the new timing is different from the original timing then create a new cron job
            initCronJob(pair[1], listingDetails.meal_ID);
        }

    });
}








await serverStartCronInit();

















const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/Images/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 1024 } // limit file size to 100MB
});


















const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// initialise the http server
const server = http.createServer(app);



//initialise the socket functinoality of the server, stored in the object "io"
const io = new Server(server);

// make a variable which contains a map of connected users
const connectedUsers = new Map();

// creates a guest id which is assigned to a connected user, this will be replaced with a userId when they login.
const createGuestID = () => {
    return 'guest_' + Math.random().toString(36).substr(2, 9);
}

io.on('connection', (socket) => {
    console.log('a user connected');


    connectedUsers.set(socket.id, createGuestID());

    socket.on('join', () => {
        console.log('User joined with ID:', socket.id);
    });




    socket.on('AddListing', async (listingDetails) => {
        console.log(listingDetails);
        try {
            await API.addListing(listingDetails);
            addCronTimes(listingDetails);
        } catch (error) {
            console.error('Error adding listing:', error);
        }
    });

    socket.on('message', (message) => {
        console.log(message);

    });

    socket.on("getReview", async(userDetails, meal_Details) => {
        const review = await getReviewFunction(userDetails.user_ID, meal_Details.meal.meal_ID);
        console.log("review fetch", review, userDetails.user_ID, meal_Details.meal.meal_ID)
        if (review){
            socket.emit("returning review", {exist: true, review:review, meal:meal_Details})
        } else{
            socket.emit("returning review", {exist:false , meal:meal_Details})
        }
    })

  socket.on("Submit Review", async(review_Details) => {
      const review = await getReviewFunction(review_Details.author_id, review_Details.meal_ID);
      console.log("review", review)
      console.log("submit review",review_Details.author_id, review_Details.meal_ID )
      console.log("submit review",review_Details)
      console.log("submit review",review_Details)

      if (review){
          await API.updateReview(review.review_id, review_Details)
      } else{
          await API.addReview(review_Details);

      }

    })


    socket.on("ReservationCount", async(userID) =>{
            const reservations = await API.reservationRetrieve(userID);
            const reservationLength = reservations.length;
            console.log("reservations",reservations, reservationLength)
            socket.emit("ReservationCount", reservationLength);

        }
    )

    socket.on("FetchUserReservations", async(userID) => {
        const reservations = await API.reservationRetrieve(userID);
        socket.emit("FetchUserReservations", reservations);
    })


    socket.on("ReserveMeal", async(reserveMeal) =>{
        console.log("reserveMeal", reserveMeal);
        await API.reserveMeal(reserveMeal);

        const meal = await API.getMealDetails(reserveMeal.meals_ID)
        console.log(meal.meal_Available)
        const newValue = (meal.meal_Available - reserveMeal.reservation_Quantity)

        await API.setMealAvailable(newValue, reserveMeal.meals_ID)
        const active_chat = await createChat(meal.meal_chef_ID, reserveMeal.user_ID);
        }
    )

    socket.on("Create Chat", async (sendersID, receiversID) => {
        console.log("sender", sendersID);
        console.log("receiver",receiversID);
        const receiversDetails = await API.getUserDetails(receiversID);
        const chatExists = await API.getConversationID(sendersID,receiversID);
        if (chatExists){
            console.log(chatExists);
            socket.emit("ChatDetailsReturn", { chatDetails: chatExists, receiversDetails: receiversDetails });
            console.log("chat details", chatExists, "rd", receiversDetails);
        }else{
            await createChat(sendersID, receiversID);
            const chatDetails = await API.getConversationID(sendersID,receiversID);
            socket.emit("ChatDetailsReturn", { chatDetails: chatDetails, receiversDetails: receiversDetails });
            console.log("chat details", chatDetails, "rd", receiversDetails);
        }





    })
    socket.on("getReservationsByMealID", async(meal_ID) => {
        const reservations = await API.getReservationsByMealID(meal_ID);
        socket.emit("mealReserves", reservations);
    })

    socket.on("Cancel Listing", async(userID, listingID) =>{
            console.log("deleteListing", listingID);
            await API.deleteListing(listingID);

            const listings = await sendUserListings((userID))
            socket.emit("userListings",listings)
        }
    )


    socket.on("editListing", async(listingDetails)=>{
        console.log("Editing listing:", listingDetails);
        await API.editListing(listingDetails)
        await updateCronTimes(listingDetails)

    })

    socket.on("getAccommodationName", async(hallID)=>{
        const hall_Details = await API.findHallID(hallID);
        socket.emit("returnHallName", hall_Details.halls_Name)

    })

    socket.on("deleteReservation", async(reservationID, reserveQuantity, mealID) =>{
        await API.deleteReservation(reservationID)
        console.log("deleteReservation", reservationID, reserveQuantity, mealID)
        const available = await API.getMealAvailable(mealID)
        console.log(available.meal_Available, reserveQuantity)
        const newValue = (available.meal_Available + reserveQuantity)
        await API.setMealAvailable(newValue, mealID)
        socket.emit("updateListing")
    })



    socket.on('viewOwnListings', async(
        userID) => {
        const listings = await sendUserListings((userID))
        socket.emit("userListings",listings)
    });





    socket.on('getReviews', async(
        user_ID) => {
        const reviews = await API.getReviews((user_ID))
        socket.emit("returnReviews",reviews)
    });

    socket.on("viewAllListings", async(halls_ID) =>{
        console.log("Halls_ID", halls_ID)
        const listings = await API.viewAllListings(halls_ID);
        console.log("All Listings", listings)
        socket.emit("allListings", listings)
        }
    )




    socket.on("Create User", async (firstName, lastName, selectedHall, email) => {
        console.log("Creating user", firstName, lastName, selectedHall, email)
        const hallID = await API.findHall(selectedHall);
        console.log("HallID:", hallID.halls_ID)
        if (hallID){
            console.log("Creating")
            await API.createUser(firstName, lastName, hallID.halls_ID, email);

            const userDetails = await API.checkEmail(email);
            if (userDetails){
                console.log("connectedUsers:", connectedUsers)
                connectedUsers.set(socket.id, userDetails.user_ID);
                console.log("connectedUsers:", connectedUsers)
                socket.emit("Login", userDetails)
            }
        }


    })


    socket.on('checkEmail', async (token, clientID) => {
        /* socket request for validating the email will be captured and the following
            will be executed */
        const client = new OAuth2Client(clientID); // client variable contains the google login object
        try { // Try block included in order to capture errors and process them accordingly
            /* Ticket is created by using Google's verification function and passing
                the paramater provided during the socket request */
            const ticket = await client.verifyIdToken({
                idToken: token, // ID Token the client recieved logging in
                audience: clientID,  // project client ID from Google Cloud Console
            });
            const payload = ticket.getPayload(); // Capture the validation results in payload.

            console.log(payload); // log the results given by google
            const email = payload.email; // retrieve the email from the payload
            // Checks the database to see if this email is assosciated with an account
            const userDetails = await API.checkEmail(email);

            if (userDetails) { // if the user is already using this email
                console.log("Email associated with an account.")
                // Alter the list of connected users to assosicate the user id with the socket
                connectedUsers.set(socket.id, userDetails.user_ID);
                /* tell the application to proceeed with login,
                and returns the userDetails of from the database */
                socket.emit("Login", userDetails);
            }else {
                console.log("Not Exist")
                /* Tells the client to proceed to the register screen as there is no recoreded
                    account */
                socket.emit('User Not Exist', {"firstName": payload.given_name,
                    "lastName": payload.family_name, "email": payload.email});
            }


        } catch (error) {
            console.error(error);
        }
    });

    socket.on('sendMessage', async (msg, lastMessageID) => {
        console.log('message: ' + msg.message);

        await API.sendMessage(msg);

        const newMessages = await API.checkConversation(msg["conversationID"], lastMessageID);
        socket.emit('New Messages', newMessages);

        const recipientId = msg.recipientId;

        // Find the recipient socket ID from connectedUsers
        console.log("connected Users:", connectedUsers)
        const recipientSocketId = Array.from(connectedUsers.entries())
            .find(([socketId, userId]) => userId === recipientId)?.[0];

        console.log("Recipient Socket ID:", recipientSocketId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('New Messages', newMessages);
        } else {
            // If recipientSocketId is not found, handle it accordingly (e.g., add to alert queue)
            console.log("Recipient Socket ID not found.");
        }
    });


    socket.on('checkConversation', async (conversationID,lastMessageID) => {
        const newMessages = await API.checkConversation(conversationID,lastMessageID);
        if (newMessages){
            socket.emit('New Messages', newMessages);
            console.log(newMessages)
        }else{
            console.log(newMessages)
        }

    });


    socket.emit('message', "message");

});

const getReviewFunction = async(userID, mealID) => {
    const review = await API.getReviewAndMeal(userID, mealID);
    return review
};

const createChat = async(person_one_ID, person_two_ID) =>{
    let existingChat = await API.checkExistingChat(person_one_ID, person_two_ID);
    if (existingChat === undefined){
        existingChat = await API.checkExistingChat(person_two_ID, person_one_ID);
        console.log("Working")
    }
    console.log(existingChat);
    if (existingChat === undefined){
        await API.createChat(person_two_ID, person_one_ID)
         await createChat(person_one_ID, person_two_ID)
    }


    console.log(existingChat);
    return existingChat;
}


const sendUserListings= async(userID) =>{
    console.log('viewOwnListings userID',userID);
    const listings = await API.viewOwnListing(userID);
    console.log('listings userID',listings);
    return listings
}







async function uploadImage(req, res) {
    console.log(req.params.userID);
    console.log("uploadimage",req.body);

    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const inputPath = req.file.path;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputPath = `./public/Images/${req.params.userID}-${uniqueSuffix}.jpg`;
    const tempPath = `./public/Images/temp-${req.file.originalname}`;

    try {
        await sharp(inputPath)
            .jpeg()
            .toFile(tempPath);

        fs.renameSync(tempPath, outputPath);
        console.log(req.params.userID, outputPath)
        res.status(200).json({ outputPath: outputPath });
    } catch (error) {
        console.log("Error uploading:", error)
        res.status(500).json({ error: 'Error writing file' });
    } finally {
        fs.unlinkSync(inputPath);
    }
}



async function returnMealImage(req, res) {
    console.log("Requested", req.params.mealID);
    const location = await API.retrieveMealImage(req.params.mealID);
    console.log("returnMealImage",location);
    try {
        const imagePath = location.meal_Image_Location;
        const imageData = await fs.promises.readFile(imagePath);

        const base64Data = imageData.toString('base64');

        // Set the response headers
        res.setHeader('Content-Type', 'image/jpeg');
        //res.setHeader('Content-Disposition', 'inline; filename=image.jpg');

        // Send the image data as the response
        console.log(base64Data);
        res.json({ imageBase64: base64Data });
    } catch (error) {
        res.status(500).json({ "error": error });
    }
}
async function returnMeals(req, res) {
    console.log("Requested", req.params.halls_ID);
    const listings = await API.viewAllListings(req.params.halls_ID);

    await matchImages(listings, res);
}

async function returnOrderableMeals(req, res) {
    console.log("Requested", req.params.halls_ID);
    const listings = await API.returnOrderableMeals(req.params.halls_ID);

    await matchImages(listings, res);
}

async function returnOwnMeals(req, res) {
    try {
        console.log("Requested", req.params.userID);
        const listings = await API.viewOwnListingsWithReservations(req.params.userID);
        console.log("Listings found", listings);

        // Map each listing to include the profile images of users who made reservations
        const enhancedListings = await Promise.all(listings.map(async (listing) => {
            // Check if there are multiple reservations
            if (listing.reservations && listing.reservations.length > 1) {
                // Fetch profile images for each reservation
                const reservationsWithImages = await Promise.all(listing.reservations.map(async reservation => {
                    const profileImageBase64 = await getProfilePictureFunction(reservation.user_ID);
                    return {
                        ...reservation,
                        userProfileImage: profileImageBase64 || 'default image base64 or link'
                    };
                }));
                listing.reservations = reservationsWithImages;
            }
            return listing;
        }));
        console.log(enhancedListings)
        const dataArray = await matchImages(enhancedListings, res);  // Assumes matchImages can handle the modified listings structure
    } catch (error) {
        console.error("Error in returnOwnMeals:", error);
        res.status(500).send("Internal server error");
    }
}
async function returnReservations(req, res) {
    console.log("Requested", req.params.userID);
    const listings = await API.getReservations(req.params.userID);
    console.log(listings);
    const dataArray =  await matchImages(listings, res);


}

async function matchImages(listings, res){
    const dataArray = [];
    try {
        for (const meal of listings) {


            const imagePath = meal.meal_Image_Location;
            const imageData = await fs.promises.readFile(imagePath);

            const base64Data = imageData.toString('base64');

            dataArray.push({"meal": meal, "retrievedImage": base64Data});
        }
        res.setHeader('Content-Type', 'application/json');
        res.json(dataArray);
    }catch
        (error)
        {
            console.log(error)
            res.status(500).json({"error": error});
        }

}



async function getConversationID(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const values = await API.getConversationID(req.params.user_one_ID,req.params.user_two_ID);
    console.log(values, req.params.user_one_ID,req.params.user_one_ID)
    res.json(values);
}

async function getMessages(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(await API.getMessages(req.params.conversationID));
}

async function getReviews(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(await API.getReviews(req.params.user_id));
}


async function getUserDetails(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const userDetails = await API.getUserDetails(req.params.userID);
    console.log("GUD", userDetails, req.params.userID)
    res.json(userDetails);
}

async function returnMealsReviews(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const listings = await API.viewOwnListing(req.params.userID);
    console.log("returning meals:", listings, req.params.userID)

    const reviews = [];
    for (const listing of listings) {
        const retrievedReviews = await API.getReviewsByMealID(listing.meal_ID);

        if (retrievedReviews.length !== 0){
            for (const review of retrievedReviews){
                console.log("adding single review", retrievedReviews)
                reviews.push(review);
            }
        }



        const imagePath = listing.meal_Image_Location;
        const imageData = await fs.promises.readFile(imagePath);

        const base64Data = imageData.toString('base64');

        listing.retrievedImage = base64Data
    }

    res.json({ meals: listings, reviews: reviews });
}



async function returnOswnMeals(req, res) {
    console.log("Requested", req.params.userID);
    const listings = await API.viewOwnListing(req.params.userID);
    const dataArray =  await matchImages(listings, res);
}


async function uploadProfileImage(req, res) {
    console.log(req.params.userID);
    console.log("uploadimage",req.body);

    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const inputPath = req.file.path;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputPath = `./public/ProfileImages/${req.params.userID}-${uniqueSuffix}.jpg`;
    const tempPath = `./public/ProfileImages/temp-${req.file.originalname}`;

    try {
        await sharp(inputPath)
            .jpeg()
            .toFile(tempPath);

        fs.renameSync(tempPath, outputPath);
        console.log(req.params.userID, outputPath)

        const userDetails = await API.getUserDetails(req.params.userID);
        if (userDetails.profileImageLocation){
            await API.updateProfileImage(req.params.userID, outputPath)
        }else {
            await API.uploadProfileImage(req.params.userID, outputPath)
        }


        const imageData = await fs.promises.readFile(outputPath);

        const base64Data = imageData.toString('base64');


        res.status(200).json({ base64Data: base64Data });
    } catch (error) {
        console.log("Error uploading:", error)
        res.status(500).json({ error: 'Error writing file' });
    } finally {
        fs.unlinkSync(inputPath);
    }
}

async function getProfilePicture(req, res) {
    console.log("Requesting profile picture for user ID:", req.params.userID);

    try {
        const base64 = await getProfilePictureFunction(req.params.userID);

        if (base64) {
            res.status(200).json({ base64Data: base64 });
        } else {
            res.status(404).json({ error: 'Profile picture not found' });
        }
    } catch (error) {
        console.error("Error getting profile picture:", error);
        res.status(500).json({ error: 'Error getting profile picture' });
    }
}

async function getProfilePictureFunction(userID) {
    console.log("Requesting profile picture for user ID:", userID);
    const userDetails = await API.getUserDetails(userID);

    if (!userDetails) {
        throw new Error('User details not found');
    }

    const imageLocation = userDetails.profileImageLocation;
    if (!imageLocation) {
        console.log("imageLocation was null");
        return null; // Or throw an error, depending on your error handling strategy
    }

    try {
        const imageData = await fs.promises.readFile(imageLocation);
        const base64Data = imageData.toString('base64');
        return base64Data;
    } catch (error) {
        console.error("Error reading image file:", error);
        throw new Error('Error reading image file');
    }
}

async function getConversations(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const values = await API.getConversations(req.params.userID);
        if (values) {
            for (const conversation of values) {
                const person_one_image =
                    await getProfilePictureFunction(conversation.person1_id)
                const person_two_image =
                    await getProfilePictureFunction(conversation.person2_id)
                conversation.person1_image = person_one_image
                conversation.person2_image = person_two_image
            }
        }


        res.status(200).json(values);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: 'Error fetching conversations' });
    }
}



function asyncWrap(PassedFunction) {
    return (req, res, next) => {
        Promise.resolve(PassedFunction(req, res, next))
            .catch((error) => next(error || new Error()));
    };
}

app.post('/uploadImage/:userID', upload.single('image'), asyncWrap(uploadImage));
app.post('/uploadProfileImage/:userID', upload.single('image'), asyncWrap(uploadProfileImage));
app.get('/returnProfilePicture/:userID', asyncWrap(getProfilePicture));
app.get('/returnMealImage/:mealID', asyncWrap(returnMealImage));
app.get('/returnMeals/:halls_ID', asyncWrap(returnMeals));
app.get('/returnOrderableMeals/:halls_ID', asyncWrap(returnOrderableMeals));
app.get('/returnOwnMeals/:userID', asyncWrap(returnOwnMeals));
app.get('/returnReservations/:userID', asyncWrap(returnReservations));
app.get('/getReviews/:user_id', asyncWrap(getReviews));
app.get('/getProfileImage/:user_id', asyncWrap(getReviews));
app.get('/getConversations/:userID', asyncWrap(getConversations));
app.get('/returnMealsReviews/:userID', asyncWrap(returnMealsReviews));
app.get('/getConversationID/:user_one_ID/:user_two_ID', asyncWrap(getConversationID));
app.get('/getUserDetails/:userID', asyncWrap(getUserDetails));
app.get('/getMessages/:conversationID', asyncWrap(getMessages));

server.listen(5000, () => {
    console.log(`Server is running at http://192.168.1.120:5000`);
});
