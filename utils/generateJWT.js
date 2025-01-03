const jwt = require("jsonwebtoken");

const generateToken = (userId, userEmail) => {
  // Create JWT token
  try {
    const token = jwt.sign(
      {
        userId,
        userEmail,
      },
      "BEARER-TOKEN",
      { expiresIn: "24h" }
    );
    return { token, succes: true };
  } catch (err) {
    return {err, success: false };
  }

};

module.exports = generateToken;