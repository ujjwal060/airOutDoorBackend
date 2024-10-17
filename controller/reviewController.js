const Review = require('../model/reviewModel');

// Add a new review
const addReview = async (req, res) => {
    try {
        const { name, email, review } = req.body;
        const newReview = new Review({ name, email, review });
        await newReview.save();

        res.status(201).json({
            message: 'Review created successfully!',
            review: newReview,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all reviews with optional search
const getReviews = async (req, res) => {
    try {
        const { search, page, limit } = req.query; // Change req.body to req.query

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const totalReviews = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({
            total: totalReviews,
            data: reviews,
            currentPage: pageNumber,
            pageSize,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete a review by ID
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({
            message: 'Review deleted successfully!',
            review: deletedReview,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addReview,
    getReviews,
    deleteReview,
};
