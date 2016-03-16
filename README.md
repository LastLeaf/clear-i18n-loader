# clear-i18n-loader #

A webpack loader for simple and clear i18n.

# Basic Usage #

`npm install --save clear-i18n-loader`

Usually, use it as the last loader `require("html!clear-i18n!./index.html")`.
This loader takes one JSON file for each file containing untranslated strings.

In the text files, put "^" around the untranslated strings.

```html
<div>^Please help me translate this!^</div>
```

```js
var str = '^Please help me translate this!^';
```

If you need the "^" character itself, write double.

```html
<div>^Ha^^_^^ha!^ <span>^^_^^</span></div>
<!-- This means "Ha^_^ha!" need to be translated, and there is a "^_^" followed in the span. -->
```

Do not like "^" character? It is configurable!
"`" character might look better, but it is used in ECMAScript 2015...

# Options #

Tips: write options like this: `clear-i18n?{"lang":"en","char":"^"}`

* `lang` the target language. It is required, or translations are silently ignored.
* `localePath` where the translation files locate. It is "[path][file].[ext].locale/" by default. The target file is a JSON file named current lang (i.e. "en.json") inside this dir.
* `char` the "^" above. ONLY special ASCII characters are allowed!
* `multiline` if there are multiline untranslated strings, please set this to true.
* `generateFile` generate target translation files, collect and put untranslated strings in. I found this feature quite useful.

# License #

MIT
