# FresCoop UEMOA - Application Mobile

## Installation

```bash
cd mobile
npm install
```

## Lancer l'app

```bash
npx expo start
```

Scannez le QR code avec **Expo Go** sur votre téléphone (Android/iOS).

## Notes

- L'app mobile est un wrapper WebView qui charge l'application web déployée sur Railway
- URL: https://frescoopuemoa.up.railway.app
- Pour tester en local, changez `APP_URL` dans `App.js` vers votre IP locale (ex: `http://192.168.1.X:5173`)
