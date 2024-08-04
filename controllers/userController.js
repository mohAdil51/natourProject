const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
// const sharp = require('sharp');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

// const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('only images!', 400), false);
  }
};
// using multer without options will result in storing the images on memory instead of disk
// body-parser can't handle files, that's why we need the multer package
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // it's better to sharpen images on memory instead of disk
  await sharp(req.file.buffer)
    // resizing as square
    .resize(500, 500)
    // format to jpeg file format
    .toFormat('jpeg')
    // compression
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...items) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (items.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1- send ERROR if password is posted
  if (req.body.password)
    return next(
      new AppError(
        'You can not updated your password from here, follow this link instead /updateMyPassword.',
        400
      )
    );

  // 2- filter out unwanted items in the body
  const filterdObj = filterObj(req.body, 'name', 'email');

  // 3- update the user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.readAll(User);
exports.getUserById = factory.readOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
