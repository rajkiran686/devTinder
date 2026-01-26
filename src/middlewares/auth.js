const adminAuth = (req, res, next) => {
    console.log("Admin authentication middleware triggered");
    const token = "xyz";
    const isAdmin = token === 'xyz';
    if (isAdmin) {
        next();
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
};  

module.exports = { adminAuth };