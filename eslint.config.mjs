// Note: eslint-config-next now ships native flat-config arrays. The
// FlatCompat + `compat.extends('next/core-web-vitals', ...)` pattern that
// `create-payload-app`'s blank template generates breaks under eslint 9 with
// this version of eslint-config-next (circular structure thrown from
// eslint-plugin-react while validating the legacy-shimmed config). Importing
// the flat configs directly avoids the shim entirely.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // preview-site/ is a fully separate app (own package.json, own Next
    // version) with its own lint setup -- run `npm run lint` inside it
    // directly rather than picking it up here.
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts', 'preview-site/', 'user-template/'],
  },
]

export default eslintConfig
