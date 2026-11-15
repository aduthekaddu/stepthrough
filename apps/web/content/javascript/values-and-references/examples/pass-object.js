function rename(user) {
  user.name = "Riya"; // @mark in-call
  user = { name: "Kabir" }; // @mark after-mutate
}
const player = { name: "Aditya" }; // @mark start
rename(player); // @mark before-call
console.log(player.name); // @mark done
