const airbnb = require('@neutrinojs/airbnb');
const react = require('@neutrinojs/react');
const loaderMerge = require('@neutrinojs/loader-merge');
const { basename, extname } = require('path');

module.exports = (neutrino, options = {}) => {
  const cacheVersion = options.cacheVersion || 'v1';

  neutrino.use(airbnb, {
    eslint: {
      fix: true,
      baseConfig: {
        extends: [
          'plugin:react/recommended',
          'eslint-config-prettier'
        ]
      },
      plugins: ['eslint-plugin-prettier'],
      rules: {
        // Specify the maximum length of a line in your program
        // JSX can get lengthy, so this helps alleviate that a bit
        // http://eslint.org/docs/rules/max-len
        'max-len': ['error', 120, 2, {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreStrings: true,
          ignoreTemplateLiterals: true
        }],
        // Allow using class methods with static/non-instance functionality
        // React lifecycle methods commonly do not use an instance context for anything
        'class-methods-use-this': 'off',
        // Disallow trailing commas on arrays, objects, functions, et al
        'comma-dangle': ['error', 'never'],
        // Prefer double or quotes in JSX attributes
        // http://eslint.org/docs/rules/jsx-quotes
        'jsx-quotes': ['error', 'prefer-double'],
        // Allow console during development, otherwise throw an error
        'no-console': process.env.NODE_ENV === 'development' ? 'off' : 'error',
        // Allow extra parentheses since multiline JSX being wrapped in parens is considered idiomatic
        'no-extra-parens': 'off',
        // Our frontend strives to adopt functional programming practices, so we prefer const over let
        'prefer-const': 'error',
        'prettier/prettier': ['error', {
          singleQuote: true,
          trailingComma: 'none',
          bracketSpacing: true,
          jsxBracketSameLine: true
        }],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
          { blankLine: 'never', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
          { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
          { blankLine: 'always', prev: '*', next: ['if', 'do', 'for', 'switch', 'try', 'while'] },
          { blankLine: 'always', prev: '*', next: 'return' }
        ],
        'consistent-return': 'off',
        'no-unused-expressions': 'off',
        'no-shadow': 'off',
        'no-return-assign': 'off',
        'babel/new-cap': 'off',
        'no-mixed-operators': 'off',
        // Force JSX closing bracket to be placed right after last prop
        'react/jsx-closing-bracket-location': ['error', 'after-props'],
        // Disallow spaces for JSX attribute braces interior
        // JSX braces are interpolation, not objects
        'react/jsx-curly-spacing': ['error', 'never'],
        // Disallow spaces around JSX attribute assignment equals (idiomatic HTML)
        'react/jsx-equals-spacing': ['error', 'never'],
        // Require JSX props to be on new lines when a component is multiline, improves readability
        'react/jsx-first-prop-new-line': ['error', 'multiline'],
        // Ensure JSX indentation uses 2 spaces
        'react/jsx-indent': ['error', 2],
        // Ensure JSX props are indented 2 spaces from opening tag
        'react/jsx-indent-props': ['error', 2],
        // Validate JSX has key prop when in array or iterator
        'react/jsx-key': 'error',
        // Prevent comments from being inserted as text nodes
        'react/jsx-no-comment-textnodes': 'error',
        // Prevent usage of unsafe target="_blank", ensure anchors also have rel="noreferrer noopener"
        'react/jsx-no-target-blank': 'error',
        // Ensure JSX components are PascalCase
        'react/jsx-pascal-case': 'error',
        // Require space before self-closing bracket in JSX
        'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
        // Ensure multiline JSX is wrapped in parentheses (idiomatic React)
        // Must be coupled with no-extra-parens: off
        'react/jsx-wrap-multilines': 'error',
        // Disable enforcement of React PropTypes
        'react/prop-types': 'off'
      }
    }
  });

  if (options.eslint) {
    neutrino.use(loaderMerge('lint', 'eslint'), options.eslint);
  }

  neutrino.use(react, options.react);

  neutrino.config.when(neutrino.options.command === 'build', (config) => {
      config
        .output
          .filename(`[name].[chunkhash].${cacheVersion}.js`)
          .chunkFilename(`[name].[chunkhash].${cacheVersion}.js`)
          .end()
        .plugin('named-chunks')
          .tap(([fn]) => [
            chunk => {
              if (chunk.name) {
                return chunk.name;
              }

              const filename = fn(chunk);
              const ext = extname(filename);

              return `${basename(filename, ext)}.${cacheVersion}${ext}`;
            }
          ]);
    });

  neutrino.config
    .when(process.env.NODE_ENV === 'development', config => {
      config.devtool('eval-source-map')
    })
    .when(
      process.env.NODE_ENV === 'production', (config) => {
        config.when(
          process.env.CI === 'true' && process.env.TRAVIS_BRANCH !== 'master',
          (config) => config.devtool(false),
          (config) => config.devtool('source-map')
        );
      });
};
