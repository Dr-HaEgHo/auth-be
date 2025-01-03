const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email : {
        type: String,
        require: [true, "Please provide an email"],
        unique:  [true, "Email Exists"]
    },

    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    }
});

module.exports = mongoose.model.users || mongoose.model("users", UserSchema);