const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: 'config.env' });

const DB = process.env.DB_URL;
mongoose
  .connect(DB)
  .then(console.log('Database connected successfully'))
  .catch((err) => console.log(`EROOR: ${err}`));

const importData = async () => {
  try {
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
    );
    const users = JSON.parse(
      fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
    );
    const reviews = JSON.parse(
      fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
    );

    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);

    console.log('Data successfully loaded!');

    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data successfully deleted!');

    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
