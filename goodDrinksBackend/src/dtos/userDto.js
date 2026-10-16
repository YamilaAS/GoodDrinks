class UserDTO {
  static toResponse(user) {
    if (!user) return null;
    const raw = typeof user.toObject === 'function' ? user.toObject() : user;
    const id = (raw._id || raw.id)?.toString();

    return {
      _id: id,
      id,
      username: raw.username,
      email: raw.email,
      followers: raw.followers || [],
      following: raw.following || [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  static toResponseList(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => this.toResponse(user));
  }
}

module.exports = UserDTO;