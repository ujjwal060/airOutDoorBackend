const Category = require('../model/catogriesModel');


const addCatogries = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;

        const imageUrl = req.fileLocation;

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
        const { search, page, limit } = req.body;

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;

        const aggregation = [];

        if (search) {
            aggregation.push({
                $match: { name: { $regex: search, $options: 'i' } }
            });
        }

        aggregation.push({
            $facet: {
                data: [
                    { $skip: (pageNumber - 1) * pageSize },
                    { $limit: pageSize },
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        });

        const result = await Category.aggregate(aggregation);

        const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const data = result[0].data;

        res.status(200).json({
            total,
            data,
            currentPage: pageNumber,
            pageSize
        });
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

const subCatogry = async (req, res) => {
    try {
        const {activeTab} = req.body;
        const result = await Category.find({ parentCategory: activeTab });
        res.status(200).json({ result })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports =
{
    addCatogries,
    getCatogry,
    deleteCatogry,
    subCatogry,
    subCatogry
}