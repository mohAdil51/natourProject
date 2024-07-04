const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DB_URL;
mongoose
  .connect(DB)
  .then(console.log('Database conencted succefully'))
  .catch((err) => console.log(`EROOR: ${err}`));

const port = process.env.PORT || 3000;

// listening to the server
app.listen(port, () => {
  console.log(`Listening to server on port: ${port}`);
});
