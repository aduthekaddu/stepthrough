function countdown(n) {
  var label = "n=" + n; // @mark body
  if (n > 0) countdown(n - 1); // @mark recurse
  console.log(label); // @mark log
}
countdown(2); // @mark start
