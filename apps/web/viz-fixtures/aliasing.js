let a = { n: 1 };
let b = a;
b.n = 2;
let c = { n: 2 };
console.log(a === b, a === c);
