function find() {
  for (let rowCount = 1; rowCount <= 1080; rowCount++) {
    for (let margin = 1; margin <= 1080 / (1 + rowCount); margin++) {
      let height = (1080 - margin * (1 + rowCount)) / rowCount;
      if (Number.isInteger(height) && height > 10 && margin < 15 && rowCount > 10) {
        console.log(`margin = ${margin}, height = ${height}, rowCount = ${rowCount}`);
      }
    }
  }
}

find();
