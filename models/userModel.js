const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    unique: true,
    type: String,
    required: [true, 'A user must have an email'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    // required: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'The password and password confirmation do not match!',
    },
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: Boolean,
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // only run this function if psssword was actually modified
  if (!this.isModified('password')) return next();

  // hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirmPassword
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.cheachTimeStamp = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedDate = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return changedDate > JWTTimeStamp; // true
  }

  return false;
};

const User = mongoose.model('User_3', userSchema);

module.exports = User;
