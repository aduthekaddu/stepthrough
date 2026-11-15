console.log(typeof declared); // @mark first
function declared() {}
var expressed = function () {}; // @mark expressed
const arrow = () => {}; // @mark arrow
console.log(typeof expressed, typeof arrow); // @mark last
