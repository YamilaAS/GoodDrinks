const userRepository = require('../repositories/userRepository');
const ratingRepository = require('../repositories/ratingRepository');
const socialRepository = require('../repositories/socialRepository');
const UserDTO = require('../dtos/userDto');
const RatingDTO = require('../dtos/ratingDto');

class SocialService {
  async followUser(currentUserId, targetUserId) {
    if (currentUserId.toString() === targetUserId.toString()) {
      const error = new Error('No puedes seguirte a ti mismo');
      error.statusCode = 400;
      throw error;
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (typeof socialRepository?.followUser === 'function') {
      await socialRepository.followUser(currentUserId, targetUserId);
    } else {
      await userRepository.addFollowing(currentUserId, targetUserId);
      await userRepository.addFollower(targetUserId, currentUserId);
    }

    return { message: 'Usuario seguido con éxito' };
  }

  async unfollowUser(currentUserId, targetUserId) {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (typeof socialRepository?.unfollowUser === 'function') {
      await socialRepository.unfollowUser(currentUserId, targetUserId);
    } else {
      await userRepository.removeFollowing(currentUserId, targetUserId);
      await userRepository.removeFollower(targetUserId, currentUserId);
    }

    return { message: 'Has dejado de seguir al usuario' };
  }

  async getFeed(userId) {
    let feed = [];

    if (typeof socialRepository?.getFeed === 'function') {
      feed = await socialRepository.getFeed(userId);
    } else {
      const currentUser = await userRepository.findById(userId);
      const followingList = currentUser?.following || [];

      const followingIds = followingList.map(item => {
        if (typeof item === 'object' && item !== null) {
          return (item._id || item.id || item).toString();
        }
        return item.toString();
      });

      if (typeof ratingRepository.getFeed === 'function') {
        feed = await ratingRepository.getFeed(followingIds);
      }
    }

    return RatingDTO.toResponseList(feed);
  }
}

module.exports = new SocialService();