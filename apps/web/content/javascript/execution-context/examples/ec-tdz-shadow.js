let level = "outer"; // @mark first
function check() {
  console.log(level); // @mark read
  let level = "inner";
}
check(); // @mark call
