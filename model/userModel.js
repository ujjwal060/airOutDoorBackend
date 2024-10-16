const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  userType: {
    type: String,
    enum: ['adventures', 'properties'],
    default: 'adventures',
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  smsConsent: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function () {
      return this.isVerified;
    },
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String
  },
  about: {
    type: String,
    trim: true,
  },
  place: {
    type: String,
    trim: true,
  },
  lang: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  skype: {
    type: String,
    trim: true,
  },
  facebook: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  linkedin: {
    type: String,
    trim: true,
  },
  youtube: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
