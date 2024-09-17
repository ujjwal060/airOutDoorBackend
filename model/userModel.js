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
      validator: function(v) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  userType: {
    type: String,
    enum: ['adventurer', 'host'],
    default: 'adventurer',
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
