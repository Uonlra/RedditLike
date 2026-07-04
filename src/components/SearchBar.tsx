import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(`/?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form className="search-wrapper" onSubmit={handleSubmit} role="search">
      <div className="search-container">
        <FaSearch className="search-icon" aria-hidden="true" />
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Reddit"
          aria-label="Search Reddit"
        />
      </div>
    </form>
  );
};

export default SearchBar;
