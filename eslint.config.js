import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**', '.ssr/**', 'node_modules/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, __SITE_ENV__: 'readonly' },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      // Разметка перенесена из макета компактно: перенос строк внутри инлайновых элементов добавил бы лишние пробелы.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  { files: ['test/**'], languageOptions: { globals: { ...globals.mocha } } },
]
