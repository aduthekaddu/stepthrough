function makeUser() {
  const user = { name: "Asha" }; // @mark in-call
  return user; // @mark before-return
}
const u = makeUser(); // @mark start
console.log(u.name); // @mark after-return
