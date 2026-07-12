import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div
            className="footer-col"
            style={{ gridColumn: "span 2" }}
          >
            <div className="logo" style={{ marginBottom: "16px" }}>
              <span className="text-gradient">OrderIt</span>
            </div>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                maxWidth: "320px",
              }}
            >
              Discover your favorite restaurants, explore delicious dishes,
              and enjoy a seamless food ordering experience anytime,
              anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Browse Restaurants</Link>
              </li>
              <li>
                <Link to="/recommendations">Recommendations</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>&copy; {new Date().getFullYear()} OrderIt. Made with</span>

            <Heart
              size={14}
              fill="var(--accent-red)"
              color="var(--accent-red)"
            />

            <span>for food lovers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;