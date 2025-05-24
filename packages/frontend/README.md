# Fake SMTP Server Frontend

A modern React + TypeScript frontend for the Fake SMTP Server built with Vite and shadcn/ui.

## Features

- 📧 **Real-time Email Monitoring** - View incoming emails with live updates
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚙️ **Server Configuration** - View SMTP server settings and connection info
- 📊 **Statistics Dashboard** - Email metrics and usage statistics
- 🔄 **Auto-refresh** - Configurable polling for new emails
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```bash
# API Configuration
# Base URL for the backend API
VITE_API_BASE_URL=http://localhost:3000

# Email refresh interval in milliseconds (default: 2000ms = 2 seconds)
VITE_REFRESH_INTERVAL=2000
```

### Environment Variable Options

- **`VITE_API_BASE_URL`**: The base URL of your backend API

  - Default: `http://localhost:3000`
  - Production example: `https://api.yourapp.com`

- **`VITE_REFRESH_INTERVAL`**: How often to check for new emails (in milliseconds)
  - Default: `2000` (2 seconds)
  - Recommended range: `1000-10000` (1-10 seconds)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Icon library
- **Radix UI** - Accessible component primitives

## Original Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
