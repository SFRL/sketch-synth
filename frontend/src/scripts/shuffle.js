const shuffleArray = (array) => {
  //Randomise order of an array
  for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    let tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }
  return array;
};

export default shuffleArray;
