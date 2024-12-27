/** @type {import("prettier").Config} */
export default {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  semi: false,
  printWidth: 80,
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^\\w+:',
    '^@/components/',
    '^@/',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    'prettier-plugin-astro',
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
}
