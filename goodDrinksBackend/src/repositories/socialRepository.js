const User = require('../models/user');
const Rating = require('../models/rating');

class SocialRepository {
  async addFollowerAndFollowing(myUserId, userToFollowId) {
    await User.findByIdAndUpdate(myUserId, { $addToSet: { following: userToFollowId } });
    await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: myUserId } });
  }

  async removeFollowerAndFollowing(myUserId, userToUnfollowId) {
    await User.findByIdAndUpdate(myUserId, { $pull: { following: userToUnfollowId } });
    await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: myUserId } });
  }

  async getUserFollowingList(userId) {
    const user = await User.findById(userId).select('following');
    return user ? user.following : [];
  }

  async getFeedByFollowingIds(followingIds, limit = 20) {
    return await Rating.find({ user: { $in: followingIds } })
      .populate('user', 'username email')
      .populate('wine', 'name winery type imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new SocialRepository();