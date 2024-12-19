const favorite = require("../model/favoriteModel");
const Category = require("../model/catogriesModel");

const addFav = async (req, res) => {
  const { userId, propertyId } = req.body;

  try {
    const existingFavorite = await favorite.findOne({ userId, propertyId });
    if (existingFavorite) {
      return res.status(400).json({ message: "Item already favorited" });
    }

    const saveFavorite = new favorite({ userId, propertyId });
    await saveFavorite.save();

    res.status(200).json({ message: "Favorite added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFav = async (req, res) => {
    const { userId } = req.params;

    try {
        const favorites = await favorite.find({ userId }).populate('propertyId');

        const formattedFavorites = favorites
            .map(fav => {
                if (!fav.propertyId) return null;
                return {
                    ...fav.propertyId.toObject(), 
                    isFavorite: true,
                };
            })
            .filter(Boolean); 

        const result = await Promise.all(
            formattedFavorites.map(async (property) => {
                const category = await Category.findById(property.category);

                return {
                    ...property,
                    category: category ? category.name : property.category,
                };
            })
        );

        res.status(200).json({
            status: 200,
            message: "get all",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFav = async (req, res) => {
  const { userId, propertyId } = req.body;

  try {
    const data = await favorite.findOneAndDelete({ userId, propertyId });
    if (!data) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({
      data: data,
      message: "Property removed from favorites",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFav,
  getFav,
  deleteFav,
};
