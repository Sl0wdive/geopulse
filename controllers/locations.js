import LocationModel from '../models/location.js';
import UserModel from '../models/user.js';
import GroupModel from '../models/group.js';
import multer from 'multer';
import { check, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';


const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({ storage: storage }).array('photos', 5);

export const createLocation = [
    
    check('name').not().isEmpty().withMessage('Name is required'),
    check('description').not().isEmpty().withMessage('Description is required'),
    check('type').isIn(['public', 'private']).withMessage('Type must be either public or private'),
    check('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    check('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    check('category').not().isEmpty().withMessage('Category is required'),

    
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, type, latitude, longitude, category, photos } = req.body;
            const location = new LocationModel({
                name,
                description,
                type,
                coordinates: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                category,
                photos,
                author: req.userId
            });
            await location.save();
            res.status(201).json(location);
        } catch (error) {
            res.status(500).json({ message: 'Error creating location', error });
        }
    }
];


export const getLocations = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        const groups = await GroupModel.find({ members: req.userId });

        const locations = await LocationModel.find({
            $or: [
                { author: user },
                { allowedUsers: user },
                { allowedGroups: { $in: groups.map(group => group._id) } },
                { type: 'public' }
            ]
        });

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error });
    }
};

export const getLocation = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const user = await UserModel.findById(req.userId);
        const groups = await GroupModel.find({ members: req.userId });

        const hasAccess = location.author.equals(req.userId)
            || location.allowedUsers.includes(req.userId)
            || location.allowedGroups.some(groupId => groups.map(group => group._id).includes(groupId))
            || location.type === 'public';

        if (!hasAccess) {
            return res.status(403).json({ message: 'You do not have access to this location' });
        }

        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching location', error });
    }
};

export const updateLocation = [
    check('coordinates.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    check('coordinates.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    check('category').optional().not().isEmpty().withMessage('Category cannot be empty'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const location = await LocationModel.findById(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'Location not found' });
            }

            if (!location.author.equals(req.userId)) {
                return res.status(403).json({ message: 'You are not the author of this location' });
            }

            if (req.body.coordinates) {
                if (req.body.coordinates.latitude !== undefined) {
                    location.coordinates.latitude = req.body.coordinates.latitude;
                }
                if (req.body.coordinates.longitude !== undefined) {
                    location.coordinates.longitude = req.body.coordinates.longitude;
                }
            }

            if (req.body.category !== undefined) {
                location.category = req.body.category;
            }

            Object.assign(location, req.body);

            await location.save();
            res.status(200).json(location);
        } catch (error) {
            res.status(500).json({ message: 'Error updating location', error });
        }
    }
];

export const deleteLocation = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            console.log('Location not found:', req.params.id);
            return res.status(404).json({ message: 'Location not found' });
        }

        if (!location.author.equals(req.userId)) {
            return res.status(403).json({ message: 'You are not the author of this location' });
        }

        console.log('Deleting location:', location);

        await location.deleteOne();
        res.status(200).json({ message: 'Location deleted' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ message: 'Error deleting location', error });
    }
};


export const uploadPhotos = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'Multer error', error: err });
        } else if (err) {
            return res.status(500).json({ message: 'Unknown error', error: err });
        }
        next();
    });
};

export const addPhotos = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (!location.author.equals(req.userId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!req.files || !req.files.length) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        req.files.forEach(file => {
            console.log(`File uploaded: ${file.filename}`);
            location.photos.push({
                url: `/uploads/${file.filename}`,
                description: req.body.description || ''
            });
        });

        await location.save();
        res.status(200).json(location);
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ message: 'Error uploading photos', error });
    }
};

export const getPhotos = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id).populate('photos');

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(location.photos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching photos', error });
    }
};

export const searchNearbyLocations = async (req, res) => {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ message: 'Please provide latitude, longitude, and radius for the search' });
    }

    try {
        const locations = await LocationModel.find({
            coordinates: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, latitude],
                        radius / 6378.1
                    ]
                }
            }
        });

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching locations", error: error });
    }
};