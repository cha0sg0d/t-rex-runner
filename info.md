# Understanding the codebase

## Randomness

```js
// Random number in a range
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```
