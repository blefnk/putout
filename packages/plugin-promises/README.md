# @putout/plugin-promises [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@putout/plugin-promises.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@putout/plugin-promises"npm"

> A `Promise` is in one of these states:
>
> - ✅ `pending`: initial state, neither fulfilled nor rejected;
> - ✅ `fulfilled`: meaning that the operation was completed successfully;
> - ✅ `rejected`: meaning that the operation failed;
>
> (c) [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

🐊[**Putout**](https://github.com/coderaiser/putout) plugin improves `Promise`-related code.

## Install

```
npm i @putout/plugin-promises -D
```

## Rule

Default options looks this way:

```json
{
    "rules": {
        "promises/add-missing-await": "on",
        "promises/apply-await-import": "on",
        "promises/apply-top-level-await": "on",
        "promises/remove-useless-resolve": "on",
        "promises/remove-useless-async": "on",
        "promises/remove-useless-await": "on",
        "promises/remove-useless-variables": "on",
        "promises/convert-reject-to-throw": "on",
        "promises/convert-new-promise-to-async": "on"
    }
}
```

☝️ If you want to override any of it, update `.putout.json` in the root directory of your project.

[🦉 Configuration](https://github.com/coderaiser/putout#-configuration) section of 🐊**Putout** documentation tell you more about all configuration options supported.

## apply-await-import

add forgotten **await** to [**dynamic `import()`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports).

### ❌ Example of incorrect code

```js
const {readFile} = import('node:fs/promises');
```

### ✅ Example of correct code

```js
const {readFile} = await import('node:fs/promises');
```

## remove-useless-resolve

### ❌ Example of incorrect code

```js
async function hello() {
    return Promise.resolve('hello');
}
```

### ✅ Example of correct code

```js
async function hello() {
    return 'hello';
}
```

## remove-useless-async

### ❌ Example of incorrect code

```js
async function hello() {
    return 'hello';
}
```

### ✅ Example of correct code

```js
function hello() {
    return 'hello';
}
```

## remove-useless-await

> If a handler function returns another pending promise object, the resolution of the **promise** returned by `then` will be subsequent to the resolution of the promise returned by the handler. Also, the resolved value of the **promise** returned by `then` will be the same as the resolved value of the **promise** returned by the handler.
>
> (c) [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then#return_value)

### ❌ Example of incorrect code

```js
await await Promise.resolve();
const hello = await 'world';
```

### ✅ Example of correct code

```js
await Promise.resolve();
const hello = 'world';
```

## convert-reject-to-throw

### ❌ Example of incorrect code

```js
async function hello() {
    return Promise.reject(Error('error'));
}
```

### ✅ Example of correct code

```js
async function hello() {
    throw Error('error');
}
```

## add-missing-await

> Using `return await` inside an `async function` keeps the current `function` in the `call stack` until the `Promise` that is being awaited has resolved, at the cost of an extra microtask before resolving the outer `Promise`. `return await` can also be used in a `try/catch statement` to catch errors from another function that returns a Promise.

> You can avoid the extra microtask by not awaiting the return value, with the trade off of the function no longer being a part of the stack trace if an error is thrown asynchronously from the `Promise` being returned. This can make debugging more difficult.
>
> (c) [ESLint](eslint.org/docs/latest/rules/no-return-await)

### ❌ Example of incorrect code

```js
runCli();

async function runCli() {}
```

### ✅ Example of correct code

```js
await runCli();

async function runCli() {}
```

## convert-new-promise-to-async

### ❌ Example of incorrect code

```js
function get() {
    return new Promise((resolve, reject) => {
        reject(Error('Cannot get'));
    });
}
```

### ✅ Example of correct code

```js
async function get() {
    throw Error('Cannot get');
}
```

## apply-top-level-await

Applies [top-level-await](https://v8.dev/features/top-level-await).

### ❌ Example of incorrect code

```js
import {readFile} from 'node:fs/promises';

(async () => {
    await readFile('./README.md', 'utf8');
})();
```

### ✅ Example of correct code

```js
import {readFile} from 'node:fs/promises';

await readFile('./README.md', 'utf8');
```

## remove-useless-variables

### ❌ Example of incorrect code

```js
async () => {
    const result = transformer.transform(realTransformer, transformCode, code, parser);
    
    const result2 = await Promise.resolve(result);
    
    return result2;
};
```

### ✅ Example of correct code

```js
async () => {
    const result = transformer.transform(realTransformer, transformCode, code, parser);
    
    return result;
};
```

## License

MIT
