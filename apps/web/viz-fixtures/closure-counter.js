function make() {
  let count = 0;
  function inc() {
    count = count + 1;
    return count;
  }
  return inc;
}
const counter = make();
counter(); // @mark after-make
counter();
