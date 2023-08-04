export const IMDBRating = ({
  imdbRating,
  title,
  imdbId,
}: {
  imdbRating: string;
  title: string;
  imdbId: string;
}) => {
  return (
    <span className="imdbRating">
      <a href={`https://www.imdb.com/title/tt${imdbId}/?ref_=plg_rt_1`}>
        <img
          src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"
          alt={` ${title} on IMDb`}
        />
      </a>
      <span className="rating">
        {imdbRating}
        <span className="ofTen">/10</span>
      </span>
      <img
        src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_star_22x21.png"
        className="star"
      />
    </span>
  );
};