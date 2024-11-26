import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      '**/ts-result',
    ],
  },
  {
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
      'no-useless-call': 'off',
      'ts/no-namespace': 'off',
      'no-cond-assign': 'off',
      'ts/no-unsafe-declaration-merging': 'off',
      'ts/method-signature-style': 'off',
    },
  },
)
