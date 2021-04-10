module.exports = {
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'linebreak-style': [
      'warn',
      'windows',
    ],
    'indent': [
      'error',
      2,
    ],
    'arrow-parens': [
      'error',
      'as-needed',
      { 'requireForBlockBody': true },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
