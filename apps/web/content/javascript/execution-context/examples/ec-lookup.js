var site = "stepthrough"; // @mark first
function page(slug) {
  function full() { // @mark page-enter
    return site + "/" + slug; // @mark lookup
  }
  return full(); // @mark inner
}
console.log(page("tdz")); // @mark call
