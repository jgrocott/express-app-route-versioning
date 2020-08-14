module.exports = {
  "extends": [
    "airbnb",
    "prettier",
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "impliedStrict": true,
      "classes": true,
      "experimentalObjectRestSpread": true,        
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "jquery": true,
    "jest": true
  },
  "rules": {
    "class-methods-use-this": "off",
    "no-debugger": 0,
    "no-alert": 0,
    "no-await-in-loop": 0,
    "no-return-assign": [
      "error",
      "except-parens"
    ],
    "no-restricted-syntax": [
      2,
      "ForInStatement",
      "LabeledStatement",
      "WithStatement"
    ],
    "no-unused-vars": [
      1,
      {
        "ignoreSiblings": true,
        "argsIgnorePattern": "res|next|^err"
      }
    ],
    "prefer-const": [
      "error",
      {
        "destructuring": "all",
      }
    ],
    "arrow-body-style": [
      2,
      "as-needed"
    ],
    "no-unused-expressions": [
      2,
      {
        "allowTaggedTemplates": true
      }
    ],
    "no-param-reassign": [
      2,
      {
        "props": false
      }
    ],
    "no-console": 0,
    "import/prefer-default-export": 0,
    "import": 0,
    "func-names": 0,
    "space-before-function-paren": 0,
    "comma-dangle": 0,
    "max-len": 0,
    "import/extensions": 0,
    "no-underscore-dangle": 0,
    "consistent-return": 0,
    "radix": 0,
    "no-shadow": [
      2,
      {
        "hoist": "all",
        "allow": [
          "resolve",
          "reject",
          "done",
          "next",
          "err",
          "error"
        ]
      }
    ],
    "quotes": [
      2,
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],
    "prettier/prettier": [
      "error",
      {
        "trailingComma": "es5",
        "singleQuote": true,
        "printWidth": 80,
      }
    ],
    "lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: false }
    ],      
    "linebreak-style": [
      "error",
      "unix"
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: [
          'block',
          'block-like',
          'cjs-export',
          'class',
          'export',
          'import'
        ],
        next: '*'
      },
      { blankLine: 'any', prev: ['export', 'import'], next: ['export', 'import'] }
    ],
    "import/no-extraneous-dependencies": ["error", {"packageDir": './'}]
  },
  "plugins": [
    "prettier",
  ]
}