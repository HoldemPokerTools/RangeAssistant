export const getRandomInt = (min = 1, max = 100) => {
  min = Math.ceil(Math.max(1, min));
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
