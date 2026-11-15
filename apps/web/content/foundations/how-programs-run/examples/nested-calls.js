function square(n) {
  return n * n; // @mark in-square
}
function sumOfSquares(a, b) {
  const x = square(a); // @mark first-call
  const y = square(b); // @mark second-call
  return x + y; // @mark before-sum
}
const total = sumOfSquares(3, 4); // @mark start-call
console.log(total); // @mark after-all
