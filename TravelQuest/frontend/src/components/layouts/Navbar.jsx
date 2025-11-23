import "./Navbar.css";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="logo">TravelQuest</h1>
      </div>

      <div className="navbar-right">
        <UserMenu />
      </div>
    </nav>
  );
}
