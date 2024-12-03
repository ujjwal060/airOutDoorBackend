const Review = require("../model/reviewModel");
const Property = require("../model/propertyModel");
const User = require("../model/userModel");

// Add a new review
// const addReview = async (req, res) => {
//     try {
//         const { name, email, review } = req.body;
//         const newReview = new Review({ name, email, review });
//         await newReview.save();

//         res.status(201).json({
//             message: 'Review created successfully!',
//             review: newReview,
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Get all reviews with optional search
// const getReviews = async (req, res) => {
//   try {
//     const { search, page, limit } = req.query; // Change req.body to req.query

//     const pageNumber = parseInt(page) || 1;
//     const pageSize = parseInt(limit) || 10;

//     const query = {};
//     if (search) {
//       query.name = { $regex: search, $options: "i" };
//     }

//     const totalReviews = await Review.countDocuments(query);
//     const reviews = await Review.find(query)
//       .skip((pageNumber - 1) * pageSize)
//       .limit(pageSize);

//     res.status(200).json({
//       total: totalReviews,
//       data: reviews,
//       currentPage: pageNumber,
//       pageSize,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({
      message: "Review deleted successfully!",
      review: deletedReview,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// code below by anurag

// code below by anurag
const addReview = async (req, res) => {
  try {
    // Extract data from request body
    const { propertyId, userId, rating, review } = req.body;

    // Validate required fields
    if (!propertyId || !userId || !rating || !review) {
      return res.status(400).json({
        message:
          "All fields are required: propertyId, userId, rating, and review.",
      });
    }

    // Check if the user exists
    const existUser = await User.findById(userId);
    if (!existUser) {
      return res.status(403).json({
        message: "User does not exist with the given ID!",
        success: false,
      });
    }

    // Check if the property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    // Create a new review
    const newReview = new Review({
      property: propertyId,
      user: userId,
      rating,
      review,
    });

    // Save the review to the database
    await newReview.save();

    // Add the review to the property's review array
    propertyExists.reviews.push(newReview._id);
    await propertyExists.save();

    // Update the average rating of the property
    const allReviews = await Review.find({ property: propertyId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRating / allReviews.length;

    // Update the average rating in the property document
    propertyExists.averageRating = averageRating.toFixed(1); // Update property average rating
    await propertyExists.save();

    // Respond to the client
    res.status(201).json({
      message: "Review created successfully!",
      review: newReview,
      reviewerName: existUser.fullName,
      updatedPropertyRating: propertyExists.averageRating,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: "Failed to create review.",
      error: error.message,
    });
  }
};

// code above by anurag

const getReviews = async (req, res) => {
  try {
    const { search, page, limit, propertyId, userId, vendorId } = req.query;
    console.log(vendorId);

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    const query = {};

    // Search filter (search reviews by content)
    if (search) {
      query.review = { $regex: search, $options: "i" };
    }

    // Filter by propertyId
    if (propertyId) {
      query.property = propertyId;
    }

    // Filter by userId
    if (userId) {
      query.user = userId;
    }

    // Filter by vendorId (filter properties by vendor)
    if (vendorId) {
      const properties = await Property.find({ vendorId }); // Get properties by vendorId
      const propertyIds = properties.map((property) => property._id); // Get all property IDs from the vendor
      query.property = { $in: propertyIds }; // Filter reviews for these properties
    }

    // Get total review count for pagination metadata
    const totalReviews = await Review.countDocuments(query);

    // Fetch paginated reviews with sorting and population
    const reviews = await Review.find(query)
      .populate("property", "propertyName location")
      .populate("user", "fullName email")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    console.log("reviews", reviews);
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

// code above by anurag

module.exports = {
  addReview,
  getReviews,
  deleteReview,
};
