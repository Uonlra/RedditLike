import { SignInButton, UserButton, useUser } from "@clerk/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { FaPlus, FaReddit, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import CreateDropdown from "./CreateDowndown";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo-link" aria-label="返回首页">
          <div className="logo-container">
            <FaReddit className="reddit-icon" />
            <span className="site-name">reddit</span>
          </div>
        </Link>

        <SearchBar />

        <div className="nav-actions">
          <Unauthenticated>
            <SignInButton mode="modal">
              <button type="button" className="sign-in-button">
                登录
              </button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            <div className="dropdown-container">
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowDropdown((isOpen) => !isOpen)}
                aria-label="创建"
              >
                <FaPlus />
              </button>
              <CreateDropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
              />
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() => user?.username && navigate(`/u/${user.username}`)}
              title="查看个人主页"
              aria-label="查看个人主页"
            >
              <FaUser />
            </button>

            <UserButton />
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
