function factorial(n) {
  if (n === 1) { // @mark check
    return 1; // @mark base-case
  }
  return n * factorial(n - 1); // @mark recurse
}
const result = factorial(3); // @mark start
console.log(result); // @mark done
