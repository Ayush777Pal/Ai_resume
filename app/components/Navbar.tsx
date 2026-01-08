import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth } = usePuterStore();

  const isLoggedIn = auth.isAuthenticated;

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="navbar flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-gradient">
        Resumite
      </Link>

      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <Link to="/upload" className="primary-button w-fit">
              Upload Resume
            </Link>

            <button
              onClick={handleLogout}
              className="secondary-button"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={auth.signIn}
            className="primary-button w-fit"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
