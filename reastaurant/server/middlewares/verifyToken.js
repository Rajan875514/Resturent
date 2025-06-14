// // const jwt = require('jsonwebtoken');

// // function verifyToken(req, res, next) {
// //     //first get the token from the request header's cookies and check if available
// //     const token = req.cookies.access_token;
// //     if (!token) {
// //         return res.status(401).send("You are not Authenticated");
// //     }
// //     //now verify token with the jwt private key
// //     jwt.verify(token, process.env.JWT_SECRET_KET, (err, user) => {
// //         if (err) {
// //             return res.status(403).send('Invalid Token');
// //         }
// //         req.user = user;
// //         next();
// //     });
// // }

// // module.exports = verifyToken;





// const jwt = require('jsonwebtoken');

// function verifyToken(req, res, next) {
//     // First, get the token from the request header's cookies and check if available
//     const token = req.cookies.access_token;
//     if (!token) {
//         return res.status(401).send("You are not Authenticated");
//     }
//     // Now verify token with the JWT private key
//     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
//         if (err) {
//             return res.status(403).send('Invalid Token');
//         }
//         req.user = user;
//         next();
//     });
// }

// module.exports = verifyToken;



const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
  // login logic: validate user etc.
  
  const user = { id: userId, role: 'Customer' }; // example user data
  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

  // set token in cookie
  res.cookie('access_token', token, {
    httpOnly: true,       // client-side JS cannot access the cookie (security)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',      // prevents CSRF (adjust as per your needs)
    maxAge: 3600000       // 1 hour in milliseconds
  });

  res.json({ success: true, message: 'Logged in successfully' });
});
