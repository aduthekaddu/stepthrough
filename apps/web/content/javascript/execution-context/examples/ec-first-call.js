var greeting = "Hi"; // @mark first
function greet(name) {
  var line = greeting + ", " + name; // @mark body
  let tail = "!"; // @mark tail
  return line + tail; // @mark ret
}
console.log(greet("Asha")); // @mark call
