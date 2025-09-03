# Agoria Social Elections Frontend

A React-based frontend application for managing social elections, built with TypeScript and Vite.

## Features

- **Company Management**: Manage juridische entiteiten (legal entities)
- **Technical Units**: Handle technische eenheden and their organizational structure
- **Personnel Management**: Manage employees and their assignments
- **Works Council**: Ondernemingsraad management functionality
- **Leadership**: Track and manage leadership roles
- **Search & Navigation**: Dynamic navigation with context-aware search functionality

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/verlindb/agoria.sv.frontend.git
   cd agoria.sv.frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Companies/     # Company-related components
│   ├── Layout/        # Layout components
│   ├── Navigation/    # Navigation components
│   ├── Personnel/     # Personnel management components
│   └── common/        # Common/shared components
├── contexts/          # React contexts
├── pages/             # Page components
├── services/          # API and data services
├── theme/             # MUI theme configuration
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.
