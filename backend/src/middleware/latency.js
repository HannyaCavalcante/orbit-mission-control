module.exports = (req, res, next) => {
  const delay = parseInt(process.env.MARS_DELAY_MS) || 0;
  if (delay > 0) setTimeout(next, delay);
  else next();
};
