let arr;

arr = [];
for (let i = 0; i < 5; i++) {
  arr[i] = i;
}

console.log(arr);

arr = Array(5); // sparse array!
console.log(arr);

arr = Array(5).map(() => Math.random());
console.log(arr);

arr = [];
arr[0] = 2;
arr[1] = undefined;
arr[4] = 3;
console.log(arr.map((i) => i * 10));

for (const i in arr) {
  console.log(i, arr[i]);
}
console.log({ ...arr });

for (const i of arr) {
  console.log(i);
}
console.log([...arr]);

arr = Array(5).fill(0);
console.log(arr);

arr = Array(5).fill(0, 1, 4);
console.log(arr);

const obj = {};
arr = Array(5).fill(obj);
obj.name = "andrew";
console.log(arr);

arr = Array(5)
  .fill(0)
  .map(() => ({}));

arr[0].name = "andrew";
console.log(arr);

arr = Array.from({ length: 5, 0: "andrew", 1: "joe", 2: "jane" });
console.log(arr);

arr = Array.from({ length: 5 }).map(() => Math.random());
console.log(arr);

arr = Array.from({ length: 5, 0: 1, 1: 2 }, (i) => i ?? Math.random());
console.log(arr);
