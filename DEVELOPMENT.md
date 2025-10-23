# Development Guide

## Project Structure

```
gotify-push-chrome/
├── css/
│   ├── variables.css      # CSS custom properties (design tokens)
│   ├── base.css          # Shared base styles and components
│   ├── popup.css         # Popup-specific styles
│   └── options.css       # Options page-specific styles
├── js/
│   ├── utils/            # Shared utility modules
│   │   ├── validation.js     # Input validation utilities
│   │   ├── errorHandler.js   # Error handling utilities
│   │   ├── gotifyApi.js      # Gotify API utilities
│   │   ├── storage.js        # Chrome storage utilities
│   │   └── ui.js            # UI utility functions
│   ├── background.js     # Service worker
│   ├── popup.js          # Popup page script
│   ├── options.js        # Options page script
│   └── i18n.js          # Internationalization
├── html/
│   ├── popup.html
│   └── options.html
├── _locales/             # Translation files
├── icons/               # Extension icons
├── scripts/
│   └── build.js         # Build script
└── dist/                # Build output
```

## Code Organization Improvements

### 1. Standardized Code Formatting

- ✅ Converted all Chinese comments to English
- ✅ Standardized JSDoc documentation format
- ✅ Consistent code style across all files
- ✅ Added ESLint and Prettier configuration

### 2. CSS Architecture

- ✅ Created centralized CSS variables system (`variables.css`)
- ✅ Extracted shared base styles (`base.css`)
- ✅ Modular CSS structure with clear separation of concerns
- ✅ Improved maintainability and consistency

### 3. Error Handling & Validation

- ✅ Created comprehensive validation utilities (`validation.js`)
- ✅ Implemented centralized error handling (`errorHandler.js`)
- ✅ Added input validation for all forms
- ✅ Improved user-friendly error messages

### 4. Code Reusability

- ✅ Created shared API utilities (`gotifyApi.js`)
- ✅ Implemented storage utilities (`storage.js`)
- ✅ Added UI utility functions (`ui.js`)
- ✅ Eliminated code duplication across modules

### 5. Build System

- ✅ Enhanced build script with validation
- ✅ Added development and production build modes
- ✅ Integrated linting and formatting checks
- ✅ Added build information generation

## Development Scripts

```bash
# Development
npm run dev          # Build for development
npm run build:dev    # Development build only

# Production
npm run prod         # Full production build with checks
npm run build        # Production build only

# Code Quality
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors
npm run format       # Format code
npm run format:check # Check code formatting

# Utilities
npm run clean        # Clean build directory
npm run validate     # Validate extension
```

## Key Features

### Modular Architecture

- **Utils modules**: Reusable functions for common tasks
- **Validation**: Comprehensive input validation
- **Error handling**: Centralized error management
- **Storage**: Chrome storage abstraction
- **API**: Gotify API integration

### CSS Design System

- **Variables**: Centralized design tokens
- **Base styles**: Shared component styles
- **Modular CSS**: Page-specific stylesheets
- **Responsive**: Mobile-friendly design

### Build System

- **ESBuild**: Fast bundling and minification
- **Validation**: Build output verification
- **Source maps**: Development debugging support
- **Optimization**: Production-ready builds

## Code Quality

- **ESLint**: JavaScript linting with Chrome extension rules
- **Prettier**: Code formatting
- **JSDoc**: Comprehensive documentation
- **Type safety**: Input validation and error handling
- **Modularity**: Reusable utility functions

## Browser Compatibility

- **Chrome Extensions Manifest V3**
- **Modern JavaScript (ES2020)**
- **CSS Custom Properties**
- **Fetch API**
- **ES Modules**

## Development Workflow

1. **Setup**: `npm install`
2. **Development**: `npm run dev`
3. **Testing**: Load extension in Chrome
4. **Production**: `npm run prod`
5. **Deployment**: Use `dist/` directory

## File Organization

### CSS Files

- `variables.css`: Design tokens and CSS custom properties
- `base.css`: Shared styles, components, and utilities
- `popup.css`: Popup-specific styles
- `options.css`: Options page-specific styles

### JavaScript Files

- `utils/`: Shared utility modules
- `background.js`: Service worker for context menu
- `popup.js`: Popup page functionality
- `options.js`: Options page functionality
- `i18n.js`: Internationalization support

### HTML Files

- `popup.html`: Extension popup interface
- `options.html`: Extension options page

## Best Practices

1. **Use utility functions** instead of duplicating code
2. **Validate inputs** before processing
3. **Handle errors gracefully** with user-friendly messages
4. **Use CSS variables** for consistent styling
5. **Document functions** with JSDoc comments
6. **Follow ESLint rules** for code quality
7. **Test thoroughly** before production builds
