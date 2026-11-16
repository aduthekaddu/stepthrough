let a = { n: 1 }; // @mark start
let b = a; // @mark one-object
b.n = 2; // @mark shared
b = { n: 3 }; // @mark after-mutate
b.n = 4; // @mark after-reassign
console.log(a.n, b.n); // @mark done
