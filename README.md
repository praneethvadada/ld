# Ganesh Lucky Draw — Winner Verification

A small website for the Sasya Ganapathi lucky draw. A participant enters their registered mobile number and
immediately sees whether they won. The design follows the Devi Sridevi Enterprises home page.

- **Frontend:** React + Vite, plain CSS
- **Backend:** Node.js + Express
- **Data:** the participant list lives in `backend/.env` and nowhere else. There is no database.

## Project structure

```
├── backend/
│   ├── src/
│   │   ├── config/        environment loading
│   │   ├── controllers/   request handling
│   │   ├── middleware/    rate limiting, error handling
│   │   ├── models/        participant list (parsed from .env, held in memory)
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/         phone number normalization
│   │   ├── app.js
│   │   └── server.js
│   ├── seed/              CSV import script and a sample sheet
│   ├── test/
│   ├── ecosystem.config.cjs   PM2 process file
│   └── .env.example
├── frontend/
│   ├── public/            logo
│   ├── src/
│   │   ├── assets/        event photo
│   │   ├── components/
│   │   ├── config/site.js all wording and contact details
│   │   ├── pages/
│   │   ├── services/      API client
│   │   ├── styles/
│   │   └── utils/
│   └── .env.example
└── deploy/nginx.conf.example
```

## Requirements

Node.js 18.18 or newer.

## Local development

Open two terminals.

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:5050`. (`.env.example` ships with five sample participants.)

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend, so no extra configuration is needed.

Sample numbers to try:

| Number     | Result              |
| ---------- | ------------------- |
| 9876543210 | Winner (Praneeth)   |
| 9876543211 | Not a winner (Rahul)|
| 9876543212 | Winner (Suresh)     |
| 9876543213 | Not a winner (Anil) |
| 9876543214 | Winner (Kiran)      |
| 9000000000 | Not found           |

> The backend defaults to port 5050 because macOS reserves port 5000 for AirPlay. Change `PORT` in
> `backend/.env` if you prefer another port, and set `API_PROXY_TARGET` in `frontend/.env` to match.

## Participant data

Participants are stored in the `PARTICIPANTS` entry of `backend/.env`, one per line:

```
PARTICIPANTS="
Praneeth,9876543210,true
Rahul,9876543211,false
"
```

Each line is `name,phone_number,is_winner`. The phone number is the unique key: every accepted way of writing a
number (`9876543210`, `+919876543210`, `+91 98765 43210`) is reduced to the same 10 digits, and a number can
only appear once.

### Importing your sheet

1. In Excel or Google Sheets, save the sheet as **CSV** with these columns:

   ```
   name,phone_number,is_winner
   Praneeth,9876543210,true
   Rahul,9876543211,false
   ```

   Column titles such as `Participant Name`, `Phone Number`, `Mobile` and `Winner Status` are recognised too,
   and the winner column accepts `true/false`, `yes/no`, `1/0` or `Winner/Not Winner`.

2. Check the sheet without changing anything:

   ```bash
   cd backend
   npm run seed -- /path/to/participants.csv --dry-run
   ```

   Invalid numbers, unclear winner values and conflicting duplicates are listed with their Excel row numbers.

3. Import it:

   ```bash
   npm run seed -- /path/to/participants.csv
   ```

   This replaces the whole `PARTICIPANTS` entry in `backend/.env` and leaves your other settings alone. If some
   rows cannot be fixed, add `--skip-invalid` to import only the valid ones.

4. Restart the backend so it loads the new list (`pm2 restart ganesh-lucky-draw-api` in production).

Once imported, the CSV is no longer needed; delete it or keep it somewhere private. `.gitignore` already
excludes `.env` and `*.csv` files.

## Environment configuration

**`backend/.env`**

| Variable               | Default                 | Purpose                                                          |
| ---------------------- | ----------------------- | ---------------------------------------------------------------- |
| `NODE_ENV`             | `development`           | Set to `production` on the server.                               |
| `PORT`                 | `5050`                  | Port the API listens on.                                         |
| `CORS_ORIGIN`          | `http://localhost:5173` | Comma-separated website origins allowed to call the API.         |
| `RATE_LIMIT_WINDOW_MS` | `60000`                 | Rate-limit window in milliseconds.                               |
| `RATE_LIMIT_MAX`       | `30`                    | Checks allowed per IP address in each window.                    |
| `TRUST_PROXY`          | `0`                     | Reverse proxies in front of the API. Set to `1` behind Nginx.    |
| `PARTICIPANTS`         | —                       | The participant list (see above).                                |

The limit is 30 checks per minute rather than a tighter number because people at the venue often share one
Wi-Fi or mobile-carrier IP address. Lower `RATE_LIMIT_MAX` if you see abuse.

**`frontend/.env`** (optional; copy from `frontend/.env.example`)

| Variable             | Purpose                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | API address. Leave empty when the API is on the same domain (the Nginx setup below).   |
| `VITE_MAIN_SITE_URL` | Your main website. When set, the logo links to it and "Visit Website" buttons appear.  |
| `API_PROXY_TARGET`   | Development only: backend address Vite forwards `/api` to.                             |

`VITE_` values are baked in at build time, so rebuild the frontend after changing them.

## API

`POST /api/lucky-draw/check`

```json
{ "phoneNumber": "9876543210" }
```

| Case         | Status | Response                                                              |
| ------------ | ------ | --------------------------------------------------------------------- |
| Winner       | 200    | `{ "success": true, "found": true, "winner": true, "name": "…" }`     |
| Not a winner | 200    | `{ "success": true, "found": true, "winner": false, "name": "…" }`    |
| Not found    | 200    | `{ "success": true, "found": false, "winner": false }`                |
| Invalid      | 400    | `{ "success": false, "error": "INVALID_PHONE", "message": "…" }`      |
| Too many     | 429    | `{ "success": false, "error": "RATE_LIMITED", "message": "…" }`       |
| Server error | 500    | `{ "success": false, "error": "SERVER_ERROR", "message": "…" }`       |

`GET /api/health` returns `{ "status": "ok" }`. There is no endpoint that lists participants.

## Tests

```bash
cd backend
npm test
```

Covers phone normalization, the `.env` list parser, the CSV import and the API (results, validation, rate
limiting, CORS, error handling).

## Production deployment (VPS)

The steps below assume Ubuntu, the project in `/var/www/ganesh-lucky-draw`, and Nginx in front.

**1. Backend**

```bash
cd /var/www/ganesh-lucky-draw/backend
npm install --omit=dev
cp .env.example .env
```

Edit `.env`:

```
NODE_ENV=production
PORT=5050
CORS_ORIGIN=https://luckydraw.example.com
TRUST_PROXY=1
```

Import the real participants (`npm run seed -- /path/to/participants.csv`), then start the API:

```bash
npm start
```

**2. Keep it running with PM2**

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Useful commands: `pm2 logs ganesh-lucky-draw-api`, `pm2 restart ganesh-lucky-draw-api`. Keep it at one
instance: the rate-limit counters and participant list are held in the process memory.

**3. Frontend**

```bash
cd /var/www/ganesh-lucky-draw/frontend
npm install
npm run build
```

The site is built into `frontend/dist`.

**4. Nginx**

`deploy/nginx.conf.example` serves `frontend/dist` and forwards `/api/` to the backend:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/lucky-draw
sudo ln -s /etc/nginx/sites-available/lucky-draw /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Change `server_name` and the `root` path in the file first. Then add HTTPS:

```bash
sudo certbot --nginx -d luckydraw.example.com
```

## Customising

- **Wording, contact numbers, branches:** `frontend/src/config/site.js`
- **Logo:** replace `frontend/public/logo.png` (square image, 256px or larger)
- **Event photo:** replace `frontend/src/assets/sasya-ganapathi.jpg`
- **Colours and fonts:** the variables at the top of `frontend/src/styles/global.css`

## Security notes

- The participant list is read once from `backend/.env` into memory. The browser never sees it; the API
  answers only for the single number submitted.
- Phone numbers are validated and normalized on both sides, request bodies are capped at 1 KB, and errors
  shown to visitors never include server details.
- Results show the number masked (`+91 ******3210`).
- `backend/.env` holds personal data. Keep its permissions at `600` and never commit it.
