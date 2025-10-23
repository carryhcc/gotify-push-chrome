module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,

  // Line formatting
  printWidth: 100,
  endOfLine: 'lf',

  // Bracket formatting
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // HTML/CSS formatting
  htmlWhitespaceSensitivity: 'css',

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
};
