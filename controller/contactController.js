const contact = require("../model/contactus");

const postContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required." });
    }

    const newContact = new contact({ name, email, message });
    await newContact.save();

    return res.status(201).json({
      message: "Thank you for contacting us. We will get back to you shortly.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllContactUs = async (req, res) => {
  try {
    const allContactUs = await contact.find().sort({createdAt:-1});
    if (!allContactUs) {
      return res.status(403).json({
        success: false,
        message: "No contact queries found",
      });
    }
    return res.status(201).json({
      message: "Getting all the Queries",
      allContactUs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const markContactRead = async (req, res) => {
  try {
    const id = req.params.id;
    const allContactUs = await contact.findByIdAndUpdate(id, {
      isRead: true,
      new: true,
    });
    return res.status(201).json({
      message: "Successfully Marked as Read",
      allContactUs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postContact,
  getAllContactUs,
  markContactRead,
};
