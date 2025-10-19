module.exports = {
  root: true,
  extends: [
    '@react-native', // from react-native-community/eslint-config
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        semi: true,
      },
    ],
    'react/no-unknown-property': [
      'error',
      {
        ignore: ['className'],
      },
    ],
  },
};
