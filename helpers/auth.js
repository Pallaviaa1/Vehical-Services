var jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const isauthorize = async (req, res, next) => {
    /*  try {
         if (!req.headers.authorization || 
             !req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(' ')[1]) {
             return res.status(200).json({
                 message:"Please provide token !"
             })
         }
 
         next();
         
     } catch (error) {
         console.log("token not valid")
     } */

    if (!req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(' ')[1]) {
        return res.status(200).json({
            message: "Please provide token !"
        })
    }
    try {
        const authtoken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(authtoken, JWT_SECRET);
        //const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({
            success:false,
            msg:"Invalid Token"
        });
    }
    next();

}

module.exports = { isauthorize };