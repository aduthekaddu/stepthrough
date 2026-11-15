var site = "stepthrough"; // @mark first
function page(slug) {
  function full() {
    return site + "/" + slug; // @mark lookup
  }
  return full(); // @mark inner
}
console.log(page("tdz")); // @mark call
