import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import LocationModel from '../models/location.js';
import UserModel from '../models/user.js';
import GroupModel from '../models/group.js';
import { 
    createLocation, 
    getLocations, 
    getLocation, 
    updateLocation, 
    deleteLocation 
} from '../controllers/locations.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Неправильний формат файлу. Завантажте лише зображення.'));
        }
    }
});

router.post('/locations', auth, createLocation);
router.get('/locations', auth, getLocations);
router.get('/locations/:id', auth, getLocation);
router.put('/locations/:id', auth, updateLocation);
router.delete('/locations/:id', auth, deleteLocation);

router.post('/locations/:id/photos', auth, (req, res) => {
    upload.array('photos', 5)(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).send({ message: 'Multer Error', error: err.message });
        } else if (err) {
            console.error('Error uploading photos:', err);
            return res.status(400).send({ message: 'Error uploading photos', error: err.message });
        }

        try {
            const location = await LocationModel.findById(req.params.id);

            if (!location) {
                console.error('Location not found');
                return res.status(404).send({ message: 'Location not found' });
            }

            const user = await UserModel.findById(req.userId);
            const groups = await GroupModel.find({ members: req.userId });

            const hasAccess = location.author.equals(req.userId)
                || location.allowedUsers.includes(req.userId)
                || location.allowedGroups.some(groupId => groups.map(group => group._id).includes(groupId))
                || location.type === 'public';

            if (!hasAccess) {
                console.error('Unauthorized access');
                return res.status(403).send({ message: 'Unauthorized' });
            }

            req.files.forEach(file => {
                console.log(`File uploaded: ${file.filename}`);
                location.photos.push({
                    url: `/uploads/${file.filename}`,
                    description: req.body.description || ''
                });
            });

            await location.save();
            res.send(location);
        } catch (error) {
            console.error('Error saving location:', error);
            res.status(500).send({ message: 'Error uploading photos', error: error.message });
        }
    });
});

router.get('/locations/:id/photos', auth, async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).send({ message: 'Location not found' });
        }

        const user = await UserModel.findById(req.userId);
        const groups = await GroupModel.find({ members: req.userId });

        const hasAccess = location.author.equals(req.userId)
            || location.allowedUsers.includes(req.userId)
            || location.allowedGroups.some(groupId => groups.map(group => group._id).includes(groupId))
            || location.type === 'public';

        if (!hasAccess) {
            return res.status(403).send({ message: 'Unauthorized' });
        }

        res.send(location.photos);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching photos', error: error.message });
    }
});

export default router;
