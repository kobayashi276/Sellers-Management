const jwt = require('jsonwebtoken');
require('dotenv/config')

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

const authenticate = (req, res, next) => {
    const token = req.session.access_token

    if (!token) {
        res.redirect('/login')
        return
    }

    try {
        let decoded = null;
        try{
            decoded = jwt.verify(token, SECRET_KEY);
        }
        catch{
            res.redirect('/login')
            return
        }
        if (decoded.permission==='seller'){
            req.user = decoded;
            next();
        }
        else if (decoded.permission==='admin'){
            req.user = decoded
            res.redirect('/admin')
            return
        }
        else{
            res.redirect('/login')
            return
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login')
    }
};

module.exports = authenticate;