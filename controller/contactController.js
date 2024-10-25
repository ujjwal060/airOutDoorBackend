const contact = require('../model/contactus');

const postContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }

        const newContact = new contact({ name, email, message });
        await newContact.save();

        res.status(201).json({ message: 'Thank you for contacting us. We will get back to you shortly.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports ={
    postContact
}