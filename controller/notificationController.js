const notification = require('../model/notificationModel');
const userModel = require('../model/userModel');
const vendorModel = require("../model/vendorModel");
const mongoose = require('mongoose');


const sendNotification = async (req, res) => {
    try {
        const { title, body, role } = req.body;
        let mappedRecipients = [];

        if (!title || !body || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (role == 'user') {
            const recipients = await userModel.find().select('_id');
            mappedRecipients = recipients.map((recipient) => ({
                userId: recipient._id,
                isRead: false,
                userType: role,
            }));
        } else {
            const recipients = await vendorModel.find().select('vendorId');
            mappedRecipients = recipients.map((recipient) => ({
                vendorId: recipient.vendorId,
                isRead: false,
                userType: role,
            }));
        }

        const notifications = new notification({
            title,
            body,
            role,
        });

        if (role == 'user') {
            notifications.recipients = mappedRecipients;
        } else {
            notifications.vendorRecipients = mappedRecipients;
        }
        const savedNotification = await notifications.save();

        res.status(200).json(savedNotification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save notification' });
    }
}

const getUserNotification = async (req, res) => {
    const { userId, page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const result = await notification.aggregate([
            {
                $match: {
                    "recipients.userId": userObjectId
                }
            },
            {
                $facet: {
                    notifications: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalNotifications: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const notifications = result[0].notifications || [];
        const totalNotifications = result[0].totalNotifications[0]?.count || 0;
        const totalPages = Math.ceil(totalNotifications / limit);

        res.json({
            notifications,
            totalPages,
            currentPage: page,
            totalNotifications,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}

const notificationReadByUser = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const updatedNotification = await notification.findOneAndUpdate(
            {
                _id: id,
                "recipients.userId": userId
            },
            { $set: { "recipients.$.isRead": true } },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification or recipient not found.' });
        }

        res.status(200).json({ message: 'Notification marked as read.', notification: updatedNotification });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred.', error });
    }
}

const getVendorNotification = async (req, res) => {
    const { vendorId, page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    try {
        const result = await notification.aggregate([
            {
                $match: {
                    vendorRecipients:{
                        $elemMatch:{
                          "vendorId":vendorId
                        }
                      }
                }
            },
            {
                $facet: {
                    notifications: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalNotifications: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const notifications = result[0].notifications || [];
        const totalNotifications = result[0].totalNotifications[0]?.count || 0;
        const totalPages = Math.ceil(totalNotifications / limit);

        res.json({
            notifications,
            totalPages,
            currentPage: page,
            totalNotifications,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}

const notificationReadByVendor = async (req, res) => {
    const { id } = req.params;
    const { vendorId } = req.body;

    try {
        const updatedNotification = await notification.findOneAndUpdate(
            {
                _id: id,
                "vendorRecipients.vendorId": vendorId
            },
            { $set: { "vendorRecipients.$.isRead": true } },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification or recipient not found.' });
        }

        res.status(200).json({ message: 'Notification marked as read.', notification: updatedNotification });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred.', error });
    }
}

module.exports =
{
    sendNotification,
    getUserNotification,
    notificationReadByUser,
    getVendorNotification,
    notificationReadByVendor
}