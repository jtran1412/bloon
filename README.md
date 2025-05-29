# Bloon Defense

A React TypeScript implementation of a tower defense game inspired by Bloons TD.

## Features

- Classic tower defense gameplay
- Multiple tower types with different abilities
- Various enemy types with different properties
- Wave-based progression system
- Interactive tower placement
- Real-time game mechanics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bloon.git
cd bloon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Project Structure

```
src/
├── components/     # React components
│   └── Game/      # Game-related components
├── game/          # Game logic and mechanics
├── types/         # TypeScript type definitions
└── assets/        # Images and other static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Game Mechanics

### Towers
- Different tower types with unique abilities
- Upgradeable towers (coming soon)
- Strategic placement options

### Enemies
- Multiple enemy types
- Progressive difficulty
- Different movement patterns

### Waves
- Wave-based gameplay
- Increasing difficulty
- Multiple enemy types per wave

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original Bloons TD game
- Built with React and TypeScript
- Uses Vite for fast development
