module.exports = {
  singleQuote: true,
  overrides: [
    {
      files: ['.prettierrc', '.eslintrc'],
      options: {
        parser: 'json',
      },
    },
  ],
};
