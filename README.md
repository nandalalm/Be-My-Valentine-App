# Be My Valentine App

A playful Valentine web app built with React and Vite.

It starts with a simple question, `Will you be my Valentine?`, but the `No` button has other plans. As the interaction continues, the `Yes` button grows, the `No` button changes mood, reaction GIFs change, music can play in the background, and the final `Yes` state turns into a full celebration screen.

## Features

- Animated Valentine-themed landing experience
- `Yes` / `No` interactive button flow
- Growing `Yes` button and shrinking `No` button
- Escalating `No` button text and evasive movement
- Different behavior for desktop and mobile
- Reaction GIF progression during the main flow
- Celebration screen with confetti and success GIF
- Background music with mute/unmute toggle
- Pink themed responsive UI ready for Vercel
- **Progressive Web App (PWA)**: Installable on iOS/Android as a standalone app
- **Offline Support**: The app can be accessed even without an internet connection once installed

## Tech Stack

- React
- Vite
- CSS

## Run Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Progressive Web App (PWA)

This project is a fully functional **Progressive Web App**. To install it on your device:

1. **On Mobile (iOS/Android)**:
   - Open the deployed URL in Safari (iOS) or Chrome (Android).
   - Tap the **Share** button (iOS) or **Menu dots** (Android).
   - Select **"Add to Home Screen"**.
   - The app will now appear on your home screen with its own icon and open without browser UI.

2. **On Desktop (Chrome/Edge)**:
   - Click the **Install Icon** in the address bar (right side).
   - Confirm the installation.
   - The app will launch in a standalone window.

## Project Structure

```text
public/
  Gifs/
  Music/
  favicon.svg
  icon-192.png
  icon-512.png
src/
  App.jsx
  index.css
  main.jsx
index.html
vercel.json
```

## Deployment

This app is set up for static deployment on Vercel.

- `vercel.json` is included
- assets are served from `public/`
- CSS is bundled by Vite during build

Deploy steps:

1. Push this repo to GitHub
2. Import the repo into Vercel
3. Use the default Vite settings
4. Deploy

## Notes

- Background music starts only after a user interaction, which is required by browser autoplay rules.
- Desktop and mobile flows are intentionally a little different for better usability.

## License

This project is for personal/creative use unless you choose to add your own license.
