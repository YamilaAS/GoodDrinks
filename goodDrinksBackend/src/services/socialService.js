const socialRepository = require('../repositories/socialRepository');

class SocialService {
  async followUser(myUserId, userToFollowId) {
    if (myUserId === userToFollowId) {
      const error = new Error('No puedes seguirte a ti mismo');
      error.statusCode = 400;
      throw error;
    }

    await socialRepository.addFollowerAndFollowing(myUserId, userToFollowId);
    return { message: 'Usuario seguido con éxito' };
  }

  async unfollowUser(myUserId, userToUnfollowId) {
    await socialRepository.removeFollowerAndFollowing(myUserId, userToUnfollowId);
    return { message: 'Has dejado de seguir al usuario' };
  }

  async getFeed(myUserId) {
    const following = await socialRepository.getUserFollowingList(myUserId);

    if (!following || following.length === 0) {
      return {
        message: 'Aún no sigues a nadie. ¡Sigue a otros usuarios para ver sus reseñas!',
        feed: []
      };
    }

    const feed = await socialRepository.getFeedByFollowingIds(following);
    return feed;
  }
}

module.exports = new SocialService();