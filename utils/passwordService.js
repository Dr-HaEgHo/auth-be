const bcrypt = require("bcrypt");

const passwordService = {
  hashPassword: async (password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return { success: true, hashedPassword };
    } catch (error) {
      return { success: false, error };
    }
  },

  validatePassword: async (password, hashedPassword) => {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      return { success: true, isValid };
    } catch (error) {
      return { success: false, error };
    }
  },
};

module.exports = passwordService;