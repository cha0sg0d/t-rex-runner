# Understanding the codebase

## Getting Started

0. `git clone https://github.com/cha0sg0d/t-rex-runner.git`
1. `python -m http.server`
2. Go to `localhost:8000`

## Randomness

```js
// Random number in a range
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

## Quests

- [x] Read Eth stream
- [ ] Add a text box to the graphics
- [ ] Add text in game every time a new block occurs
