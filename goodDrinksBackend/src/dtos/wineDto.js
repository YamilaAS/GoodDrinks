class WineDTO {
  static toResponse(wine) {
    if (!wine) return null;
    const raw = typeof wine.toObject === 'function' ? wine.toObject() : wine;
    const id = (raw._id || raw.id)?.toString();

    return {
      _id: id,
      id,
      name: raw.name,
      winery: raw.winery,
      type: raw.type,
      variety: raw.variety,
      vintage: raw.vintage ?? raw.year,
      region: raw.region,
      country: raw.country,
      description: raw.description,
      imageUrl: raw.imageUrl,
      averageRating: raw.averageRating ?? 0,
      ratingsCount: raw.ratingsCount ?? 0,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  static toResponseList(wines) {
    if (!Array.isArray(wines)) return [];
    return wines.map(wine => this.toResponse(wine));
  }
}

module.exports = WineDTO;