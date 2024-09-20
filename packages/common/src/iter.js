const iterator = {
  fibSet: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],
  next() {
    const value = this.fibSet.shift();

    if (value == null) {
      return {
        value: undefined,
        done: true,
      };
    }

    return {
      value,
      done: false,
    };
  },
  [Symbol.iterator]() {
    return this;
  },
};

function* fibIter() {
  const fibSet = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];

  while (fibSet.length) {
    yield fibSet.shift();
  }
}

function* zip(iter1, iter2) {
  while (true) {
    const val1 = iter1.next();
    const val2 = iter2.next();

    if (val1.done || val2.done) {
      return;
    }

    yield [val1.value, val2.value];
  }
}

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

console.log(...iterator);

for (const value of iterator) {
  console.log(value);
}

const i1 = fibIter();
const i2 = fibIter();
i2.next();
const zipped = zip(i1, i2);

console.log(...zipped);
