const User = require('../models/User');

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
    }

    // MED-004 fix: Self-registration always assigns 'developer' role.
    // Role elevation requires admin action via PUT /auth/users/:id/role.
    const safeData = { ...userData, role: 'developer' };

    const user = await User.create(safeData);
    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Account deactivated. Contact administrator.'), { statusCode: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
    }

    user.password = newPassword;
    await user.save();
    return { message: 'Password updated successfully' };
  }

  async getAllUsers(query = {}) {
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return users;
  }
}

module.exports = new AuthService();
