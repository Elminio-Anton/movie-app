import { getGenres } from "../requests/common";

export const genres = (() => {
  let innerGenres: { id: number; name: string };
  return {
    set: (genres: { id: number; name: string }) => {
      innerGenres = { ...genres };
    },
    getByIds: (genre_ids: number[]) =>
      Object.entries(innerGenres)
        .filter((genre) => genre_ids.some((id) => id === +genre[0]))
        .map((genre) => String(genre[1])),
    get: () => {
      return innerGenres;
    },
  };
})();

getGenres().then(([tvGenres, movieGenres]) => {
  genres.set({
    ...tvGenres.genres.reduce(
      (newGenresObject: Object, genre: { id: number; name: string }) =>
        Object.assign(newGenresObject, { [genre.id]: genre.name }),
      {}
    ),
    ...movieGenres.genres.reduce(
      (newGenresObject: Object, genre: { id: number; name: string }) =>
        Object.assign(newGenresObject, { [genre.id]: genre.name }),
      {}
    ),
  });
});