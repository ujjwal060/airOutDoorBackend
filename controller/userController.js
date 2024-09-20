const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const sendEmail = require('../comman/sendEmail');


const sendVerificationEmail = async (email, verificationCode) => {
    const subject = 'Registration Verification Code';
    const message = `Welcome to Air Outdoors! Your verification code is: ${verificationCode}. Please use this code to verify your account within 15 minutes.`;
    await sendEmail(email, subject, message);
};

const signupUser = async (req, res) => {
    try {
        const { fullName, email, username, mobileNumber, userType,termsAccepted,smsConsent } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            if (existingUser.email === email && existingUser.isVerified) {
                return res.status(400).json({ message: 'Email already in use. Please verify your email with the new verification code' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already in use' });
            }
        }

        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        const newUser = new User({
            fullName,
            email,
            username,
            mobileNumber,
            userType,
            termsAccepted,
            smsConsent,
            verificationCode,
            verificationCodeExpires,
        });

        await newUser.save();
        await sendVerificationEmail(email, verificationCode);

        res.status(201).json({ message: 'Signup successful. Verification code sent your mail. After verification, you will be able to set your password' });
    } catch (error) {
        res.status(500).json({ message:error.message });
    }
}

const userVerify = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: 'Verification success. You can now create a password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'User is not verified' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password set successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while setting password', error: error.message });
    }
}

const resendCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }
        if (user.verificationCodeExpires > Date.now()) {
            return res.status(400).json({ message: 'Verification code is still valid. Please check your email for the existing code.' });
        }
        const newVerificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationCode = newVerificationCode;
        user.verificationCodeExpires = newVerificationCodeExpires;

        await user.save();

        await sendVerificationEmail(email, newVerificationCode);

        res.status(200).json({ message: 'New verification code sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'User is not verified' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

const forgate = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        const newVerificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationCode = newVerificationCode;
        user.verificationCodeExpires = newVerificationCodeExpires;

        await user.save();

        const subject = 'Password Reset OTP';
        const message = `Your password reset OTP is: ${newVerificationCode}. Please use this OTP to reset your password. This OTP is valid for 15 minutes.`;

        await sendEmail(user.email, subject, message);

        res.status(200).json({ message: 'OTP sent to your email for password reset' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset request', error: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params;
        if (!oldPassword || !newPassword) {
            return res.status(400).send('Old password and new password are required');
        }
        const users = await User.findById(userId);
        if (!users) return res.status(404).send('Vendor not found');

        const isPasswordValid = await bcrypt.compare(oldPassword, users.password);
        if (!isPasswordValid) return res.status(400).send('Old password is incorrect');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users.password = hashedPassword;

        await users.save();
        res.status(200).json({ message: 'Password changed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    signupUser,
    userVerify,
    resendCode,
    setPassword,
    loginUser,
    forgate,
    resetPassword,
    changePassword
}