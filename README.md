# LVL Widget

A desktop task widget with a leveling system built with React and Electron.

## Features

- Desktop widget interface
- Task management with leveling system
- Always-on-top display
- Transparent background
- Windows desktop integration

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
# Start the React development server
npm start

# In another terminal, start the Electron app
npm run electron

# Or run both simultaneously
npm run electron-dev
```

#### Production Build
```bash
# Build the React app
npm run build

# Package the Electron app
npm run electron-pack
```

## Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run electron` - Start Electron app
- `npm run electron-dev` - Start both React and Electron in development mode
- `npm run electron-pack` - Package Electron app for distribution

## Project Structure

```
src/
├── components/
│   └── ui/           # UI components
├── lib/
│   └── utils.js      # Utility functions
├── App.js            # Main React component
├── App.css           # App styles
├── index.js          # React entry point
└── index.css         # Global styles

public/
├── electron.js       # Electron main process
└── index.html        # HTML template
```

## Configuration

The app uses:
- **React** for the UI
- **Electron** for desktop integration
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

## Build Output

- `build/` - React production build
- `dist/` - Electron packaged applications

## License

Private project
