const notification = require('../model/notificationModel');
const userModel = require('../model/userModel');
const vendorModel=require("../model/vendorModel");


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
        }else{
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

        if(role=='user'){
            notifications.recipients= mappedRecipients;
        }else{
            notifications.vendorRecipients=mappedRecipients;
        }
        const savedNotification = await notifications.save();

        res.status(200).json(savedNotification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save notification' });
    }
}

module.exports =
{
    sendNotification
}