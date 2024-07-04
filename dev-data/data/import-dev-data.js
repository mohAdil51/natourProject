const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: 'config.env' });

const DB = process.env.DB_URL;
mongoose
  .connect(DB)
  .then(console.log('Database connected successfully'))
  .catch((err) => console.log(`EROOR: ${err}`));

const importData = async () => {
  try {
    console.log(process.env.DB_URL);
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
    );

    await Tour.create(tours);
    console.log('Data successfully loaded!');

    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');

    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === 'import') {
  importData();
} else if (process.argv[2] === 'delete') {
  deleteData();
}
