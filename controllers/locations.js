import LocationModel from '../models/location.js';
import UserModel from '../models/user.js';
import GroupModel from '../models/group.js';


export const createLocation = async (req, res) => {
    try {
        const location = new LocationModel({
            ...req.body,
            author: req.userId
        });
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error creating location', error });
    }
};


export const getLocations = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        const groups = await GroupModel.find({ members: req.userId });

        const locations = await LocationModel.find({
            $or: [
                { author: req.userId },
                { allowedUsers: req.userId },
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


export const updateLocation = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (!location.author.equals(req.userId)) {
            return res.status(403).json({ message: 'You are not the author of this location' });
        }

        Object.assign(location, req.body);
        await location.save();
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error });
    }
};


export const deleteLocation = async (req, res) => {
    try {
        const location = await LocationModel.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (!location.author.equals(req.userId)) {
            return res.status(403).json({ message: 'You are not the author of this location' });
        }

        await location.remove();
        res.status(200).json({ message: 'Location deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting location', error });
    }
};
