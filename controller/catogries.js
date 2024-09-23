const Category = require('../model/catogriesModel');


const addCatogries = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;

        const imageUrl = req.file.path;

        const category = new Category({
            name,
            parentCategory,
            image: imageUrl,
        });

        await category.save();

        res.status(201).json({
            message: 'Category created successfully!',
            category,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getCatogry = async (req, res) => {
    try {
        const result = await Category.find();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteCatogry = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category deleted successfully!',
            category,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addCatogries, getCatogry, deleteCatogry }
