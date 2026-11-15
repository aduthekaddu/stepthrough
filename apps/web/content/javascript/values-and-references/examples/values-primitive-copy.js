let a = 5; // @mark start
let b = a; // @mark before-copy
a = 6; // @mark before-reassign
console.log(a, b); // @mark done
