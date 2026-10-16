const socialService = require('../services/socialService');

exports.followUser = async (req, res, next) => {
  try {
    const result = await socialService.followUser(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const result = await socialService.unfollowUser(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const feed = await socialService.getFeed(req.user.id);
    res.status(200).json(feed);
  } catch (err) {
    next(err);
  }
};