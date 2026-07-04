import "../styles/Navbar.css"
import { Show, SignInButton, UserButton } from "@clerk/react"
import { FaReddit } from "react-icons/fa"
import { Link } from "react-router-dom"

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo-link" aria-label="Go to home">
                    <div className="logo-container">
                        <FaReddit className="reddit-icon" />
                        <span className="site-name">reddit</span>
                    </div>
                </Link>

                <div className="nav-actions">
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button type="button" className="sign-in-button">
                                Sign In
                            </button>
                        </SignInButton>
                    </Show>

                    <Show when="signed-in">
                        <UserButton />
                    </Show>
                </div>
            </div>
        </nav>
    )
}

export default Navbar