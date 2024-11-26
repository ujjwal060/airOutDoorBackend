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
                userId: recipient.vendorId,
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
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}

module.exports =
{
    sendNotification,
    getUserNotification
}