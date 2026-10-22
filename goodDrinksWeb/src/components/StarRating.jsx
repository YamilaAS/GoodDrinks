export default function StarRating({ rating = 0, onRatingChange = null, size = "md" }) {
  const stars = [1, 2, 3, 4, 5];
  const isInteractive = Boolean(onRatingChange);

  const starSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl"
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <button
            type="button"
            key={star}
            disabled={!isInteractive}
            onClick={() => isInteractive && onRatingChange(star)}
            className={`${starSizes[size]} transition-colors ${
              isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${isFilled ? 'text-amber-400' : 'text-slate-600'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}