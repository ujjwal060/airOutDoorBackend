const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'vendor'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  recipients: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isRead: { type: Boolean, default: false },
    },
  ],
  vendorRecipients: [
    {
      vendorId: { type:String, ref: 'Vendor' },
      isRead: { type: Boolean, default: false },
    },
  ],
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
