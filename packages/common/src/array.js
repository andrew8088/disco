let arr;

// arr = Array(5).fill([]);
arr = Array.from(Array(5), () => []);

arr[0][0] = 1;

console.log(arr);
