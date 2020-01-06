const today = new Date();

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
};

const day = today.toLocaleDateString("en-us", options);

module.exports = day;
