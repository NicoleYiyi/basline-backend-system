module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
      parser: '@babel/eslint-parser',
      ecmaVersion: 2021,
      sourceType: 'module',
      requireConfigFile: false
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended'
    ],
    rules: {
      // 你可以根據團隊需求調整這邊的規則
      // 'vue/multi-word-component-names': 'off'
    }
  }
  