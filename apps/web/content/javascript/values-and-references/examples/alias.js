let a = { n: 1 }; // @mark start
let b = a; // @mark one-object
b.n = 2; // @mark two-arrows
console.log(a.n); // @mark done
