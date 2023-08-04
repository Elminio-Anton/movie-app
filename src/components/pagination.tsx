import { NavLink,useSearchParams } from "react-router-dom";
import { homePage } from "../constants";

export const Pagination = ({
  pages,
  activePage,
  route,
}: {
  pages: number;
  activePage: number;
  route: string;
}) => {
  let [searchParams, setSearchParams] = useSearchParams();
  const PaginationButton = ({ page }: { page: string }) => {
    return (
      <NavLink
        to={`${homePage}/${route}/${page}?${searchParams}`}
        className={({ isActive }) =>
          `pagination-link ${
            isActive ? "active-pagination" : "inactive-pagination"
          }`
        }>
        {" "}
        {`${page}`}
      </NavLink>
    );
  };
  const getNearestIntegersAndDots = (
    currentNumber: number = 1,
    amountOfNumbersToReturn_odd: number = 1,
    totalNumbers: number = 1
  ) => {
    let amountOfNumbers =
      amountOfNumbersToReturn_odd % 2
        ? amountOfNumbersToReturn_odd
        : amountOfNumbersToReturn_odd - 1;
    let numbersArr: (number | string)[] = [currentNumber];
    if (amountOfNumbersToReturn_odd >= totalNumbers)
      numbersArr = [...new Array(amountOfNumbers)].map((_, i) => i + 1);
    else if (currentNumber - ((amountOfNumbers - 1) / 2 + 1) <= 0) {
      numbersArr = [...new Array(amountOfNumbers - 1)].map((_, i) => i + 1);
      numbersArr.push("...", totalNumbers);
    } else if (currentNumber + (amountOfNumbers - 1) / 2 + 1 > totalNumbers) {
      numbersArr = [...new Array(totalNumbers)]
        .map((_, i) => i + 1)
        .slice(-amountOfNumbers + 1);
      numbersArr.unshift(1, "...");
    } else {
      for (let i = Math.trunc((amountOfNumbers - 3) / 2); i >= 1; i--) {
        numbersArr.push(currentNumber - i);
        numbersArr.push(currentNumber + i);
      }
      numbersArr.sort((a, b) => +a - +b);
      numbersArr.unshift(1, "...");
      numbersArr.push("...", totalNumbers);
    }
    return numbersArr;
  };
  return (
    <ul className="pagination-list">
      {getNearestIntegersAndDots(activePage, 7, pages).map(
        (page_number, id) => {
          if (page_number === "...")
            return (
              <span className="dots" key={-id}>
                ...
              </span>
            );
          else
            return (
              <li
                className="navlink-container"
                key={page_number}
                style={{ width: `${String(page_number).length * 15 + 10}px` }}>
                <PaginationButton page={`${page_number}`}></PaginationButton>
              </li>
            );
        }
      )}
    </ul>
  );
};
