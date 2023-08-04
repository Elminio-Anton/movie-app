export const TMDBRating = ({ rating }: { rating: number }) => {
  return (
    <div className="tmdb-rating">
      <div className="logo">TMDB</div>
      <span>
        <span className="rating">{rating}</span>
        <span className="ofTen">/10</span>
      </span>
    </div>
  );
};