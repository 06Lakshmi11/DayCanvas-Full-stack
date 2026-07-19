# DayCanvas Backend

A Node.js + Express + MongoDB API that gives DayCanvas real user accounts and lets your notes sync across any device you log into.

## Tech Stack

- **Express** — web server framework
- **MongoDB (via Mongoose)** — database, hosted free on MongoDB Atlas
- **JWT (jsonwebtoken)** — login sessions
- **bcryptjs** — securely hashes passwords (never stored in plain text)

## Project Structure

```
daycanvas-backend/
├── server.js              # app entry point
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js              # user schema, password hashing
│   └── Note.js              # note schema (matches the frontend's note shape)
├── middleware/
│   └── auth.js              # verifies login tokens on protected routes
├── controllers/
│   ├── authController.js    # register / login / get current user
│   └── noteController.js    # create / read / update / delete notes
└── routes/
    ├── authRoutes.js
    └── noteRoutes.js
```

## Step 1 — Create a free MongoDB Atlas database

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and sign up (free)
2. Create a new **free (M0) cluster** — takes a couple minutes to provision
3. Under **Database Access**, create a database user with a username and password (save these!)
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) — simplest for development
5. Go back to your cluster, click **Connect** → **Drivers**, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the database user you created, and add `daycanvas` as the database name right before the `?`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/daycanvas?retryWrites=true&w=majority
   ```

## Step 2 — Configure environment variables

1. In this folder, copy `.env.example` to a new file named `.env`
2. Paste your MongoDB connection string into `MONGODB_URI`
3. Set `JWT_SECRET` to any long random string (you can generate one at [randomkeygen.com](https://randomkeygen.com) or just mash your keyboard for 40+ characters)
4. Leave `PORT` and `FRONTEND_URL` as-is for local development

## Step 3 — Install and run

```bash
npm install
npm run dev
```

You should see:
```
MongoDB connected
DayCanvas API listening on http://localhost:5000
```

## Step 4 — Test it

Visit `http://localhost:5000` in your browser — you should see:
```json
{ "message": "DayCanvas API is running." }
```

## API Reference

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account — body: `{ name, email, password }` |
| POST | `/api/auth/login` | No | Log in — body: `{ email, password }`, returns a token |
| GET | `/api/auth/me` | Yes | Get the logged-in user's info |
| GET | `/api/notes` | Yes | Get all of the logged-in user's notes |
| POST | `/api/notes` | Yes | Create a note — body includes `dateKey` plus note fields |
| PUT | `/api/notes/:id` | Yes | Update a note |
| DELETE | `/api/notes/:id` | Yes | Delete a note |

For any route marked "Auth required," include the token from login/register in the request header:
```
Authorization: Bearer <token>
```

## Deploying it for real (not just localhost)

Free options that work well for a project like this:
- **Render** (render.com) — free tier, easy Node.js deployment
- **Railway** (railway.app) — free tier, very simple setup

Once deployed, update `FRONTEND_URL` in your environment variables to your real deployed frontend URL (e.g. your Vercel link), and update the frontend's API base URL to point to your deployed backend URL instead of `localhost:5000`.
