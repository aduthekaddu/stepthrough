const a = { n: 1 };
const b = a; // @mark alias
b.n = 2;
console.log(a.n);
