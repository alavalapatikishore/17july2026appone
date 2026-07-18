# DentalCare HMS — Frontend

A responsive dental hospital management system dashboard, styled after the eHospital reference layout with a dedicated dental identity (teal/navy theme, interactive Odontogram tooth chart).

## What's included
- `index.html` — Dashboard with stat cards + full module icon grid
- `pages/appointments.html` — Appointments list with filters
- `pages/patient-registration.html` — Patient intake form
- `pages/odontogram.html` — Interactive clickable tooth chart (click a tooth to cycle: healthy → cavity → filled → crown → missing)
- `css/style.css` — All styling (fully responsive: desktop, tablet, mobile with collapsible sidebar)
- `js/app.js` — Sidebar toggle, sub-nav collapse, odontogram logic, toast notifications
- `Dockerfile` + `nginx.conf` — Serves the static app via nginx

Other sidebar/dashboard modules (Billing, Pharmacy, Radiology, HR, etc.) are wired up as clickable cards that show a "coming soon" toast — ready for you to build out real pages the same way.

## Run with Docker

Build the image:
```bash
docker build -t dentalcare-hms .
```

Run the container:
```bash
docker run -d -p 8080:80 --name dentalcare-hms dentalcare-hms
```

Open in your browser:
```
http://localhost:8080
```

Stop and remove:
```bash
docker stop dentalcare-hms && docker rm dentalcare-hms
```

## Run without Docker (quick local preview)
Just open `index.html` directly in a browser, or serve the folder with any static server, e.g.:
```bash
python3 -m http.server 8080
```

## Notes
- No build step / no npm install required — pure HTML, CSS, and vanilla JS.
- Fonts (Outfit, Inter) load from Google Fonts CDN — requires internet access in the browser.
- To add a new module page: copy `pages/appointments.html` as a template, update the sidebar `active` class, and link it from `index.html`'s module grid.
