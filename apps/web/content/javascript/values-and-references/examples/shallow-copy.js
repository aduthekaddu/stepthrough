const original = { name: "chess", players: ["Asha", "Ben"] }; // @mark start
const copy = { ...original }; // @mark before-spread
copy.name = "go"; // @mark two-boxes
copy.players.push("Chen"); // @mark after-name
console.log(original.name, original.players.length); // @mark done
