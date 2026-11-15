const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
const first = fns[0]();
