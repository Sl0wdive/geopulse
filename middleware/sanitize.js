import sanitizeHtml from 'sanitize-html';

export const sanitizeBody = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        req.body[key] = sanitizeHtml(req.body[key]);
    });
    next();
};
