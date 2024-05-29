import ReviewModel from '../models/review.js';
import LocationModel from '../models/location.js';

export const addReview = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const review = new ReviewModel({
            location: req.params.id,
            user: req.userId,
            rating: req.body.rating,
            comment: req.body.comment
        });

        await review.save();

        location.reviews.push(review._id);
        await location.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error });
    }
};

export const getReviews = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const reviews = await ReviewModel.find({ location: req.params.id }).populate('user', 'name');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};