# Fresher – student meal marketplace

Fresher is a React Native + Node.js app I built as my final year project at university.

The idea was to let students cook extra portions and sell them to other people in their halls – cheaper than takeaway, and a bit more trustworthy because everything is tied to university emails and accommodation.

It’s a small full-stack system:

- **Mobile app:** React Native, Socket.IO client, Google Sign-In
- **Backend:** Node.js, Express, Socket.IO, SQLite
- **Extras:** image upload + resizing, simple chat and reviews

I’ve done some light clean-up recently, but it’s still very much a uni-era project.

---

## What you can do

### As a buyer

- **Sign in with Google** using a university email
- **Register once** with your name and hall
- **Browse meals** being sold in your hall
- **View details**: image, name, price, description, availability
- **Reserve a meal** – this creates a reservation and reduces availability
- **See your reservations** on your profile, with images and prices

### As a seller

- **Create listings** with:
  - Title, price, quantity, description  
  - Photo picked from the phone gallery (cropped before upload)
- **Manage your listings**:
  - See your own meals in a separate view
  - Edit or cancel a listing
- **See who reserved your meals** (joined in the backend with user details)

### Messaging & reviews (basic)

- When a reservation happens, the backend ensures there’s a chat between buyer and seller.
- Messages are stored in SQLite and pushed via Socket.IO.
- Users can leave or update a review on a meal; reviews are linked to both the meal and the author.

---

## How it’s put together

### Mobile app

- React Native functional components + hooks
- Screen “navigation” done with simple `currentPage` string state (no navigation library)
- Socket.IO is used for:
  - Auth (`checkEmail`, `Login`, `User Not Exist`, `Create User`)
  - Listing and reservation events (`viewAllListings`, `userListings`, `ReserveMeal`, etc.)
- Images are loaded by:
  - Uploading via `fetch` + `FormData` to the backend
  - Later retrieved as base64 from `/returnMealImage/:meal_ID`

### Backend

- **Node.js + Express** for HTTP endpoints
- **Socket.IO** for realtime events (auth, listings, reservations, chat, reviews)
- **SQLite** accessed via `sqlite` + `sqlite3`
- **multer** + **sharp** for image upload and processing (stored on disk, path saved in DB)
- **google-auth-library** to verify Google ID tokens server-side
- **cron** jobs to update `meal_status` over time (e.g. PREORDER → ORDER → SERVE → CLOSED based on start/end timestamps)

The database uses tables for users, halls, meals, reservations, chats, messages and reviews. Migrations are run on startup.

---

## Running it

> This is an older React Native project from 2023, most libraries will be outdated, aswell as other services such as gradle. 

### Backend

```bash
# from the server folder
npm install
node Server.mjs

Runs migrations on Database.sqlite
Serves HTTP + websockets on port 5000
Serves static files from public/
The mobile app expects the base URL from Config("url") to point here (e.g. http://192.168.x.x:5000 on the same network).
```

### Mobile app
```bash
# from the React Native app root
npm install

# Start Metro
npx react-native start

# Run on Android (SDK + device/emulator required)
npx react-native run-android
```
### What I’d change if I revisited it

If I were rebuilding Fresher now, I’d:
- Use React Navigation instead of manual currentPage strings
- Wrap Socket.IO in a small client or React hook instead of wiring it everywhere
- Clean up SQL (no string interpolation) and split the backend into clearer modules
- Add proper validation, error states, and tests
- I’ve left most of the original structure in place so it shows honestly where my React Native / Node skills were at the time.

