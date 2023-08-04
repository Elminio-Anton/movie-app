export const localFavourites = (() => {
  let local = window.localStorage;
  return {
    check: (id: number) => {
      return (
        local.getItem("favourites") &&
        local.getItem("favourites")?.includes(`${id}`)
      );
    },
    add: (id: number) => {
      if (local.getItem("favourites") !== null)
        local.setItem("favourites", local.getItem("favourites") + " " + id);
      else local.setItem("favourites", String(id));
    },
    remove: (id: number) => {
      if (local.getItem("favourites") !== null)
        local.setItem(
          "favourites",
          (local.getItem("favourites") || "").replace(`${id}`, "")
        );
    },
  };
})();