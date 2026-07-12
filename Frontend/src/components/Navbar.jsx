import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ShoppingCart,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Compass,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const { user, cart, theme, toggleTheme, logout } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const displayName = user?.name
    ? user.name.split(" ")[0]
    : user?.email
      ? user.email.split("@")[0]
      : "Guest";

  const isDark = theme === "dark";

  // Orange palette (Swiggy/Zomato inspired)
  const navbarBg = isDark
    ? "linear-gradient(145deg, #1A0A00, #2D1200)"
    : "linear-gradient(135deg, #eb8c67, #d54f43)";

  const textColor = "#ffffff";
  const activeColor = "#fc704d";
  const dropdownBg = isDark ? "#1e293b" : "#ffffff";
  const dropdownText = isDark ? "#e2e8f0" : "#1f2937";

  return (
    <nav
      style={{
        background: navbarBg,
        padding: "14px 0",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.5)"
          : "0 4px 24px rgba(252,128,25,0.3)",
        borderBottom: `1px solid ${isDark ? "rgba(252,128,25,0.2)" : "rgba(255,255,255,0.15)"}`,
        transition: "background 0.3s ease, box-shadow 0.3s ease",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            fontSize: "28px",
            fontWeight: "900",
            letterSpacing: "-0.5px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              textShadow: "0 0 20px rgba(255,255,255,0.3)",
            }}
          >
            🍽️OrderIt
          </span>
          <Sparkles
            size={22}
            color="#fb4f24"
            style={{ filter: "drop-shadow(0 0 8px rgba(251, 90, 36, 0.6))" }}
          />
        </Link>

        {/* Navigation Links */}
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "10px",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "999px",
                textDecoration: "none",
                color: isActive("/") ? "#f0f5f6" : textColor,
                background: isActive("/")
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(255,255,255,0.1)",
                fontWeight: isActive("/") ? "700" : "500",                                
                transition: "all 0.2s",
                border: isActive("/")
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Compass size={18} />
              <span>Explore</span>
            </Link>
          </li>

          {user && user.role !== "admin" && (
            <li>
              <Link
                to="/recommendations"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 20px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  color: isActive("/recommendations") ? "#fba524" : textColor,
                  background: isActive("/recommendations")
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.1)",
                  fontWeight: isActive("/recommendations") ? "700" : "500",
                  transition: "all 0.2s",
                  border: isActive("/recommendations")
                    ? "1px solid rgba(255,255,255,0.3)"
                    : "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Sparkles size={18} />
                <span>AI Recommend</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Right Side Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: textColor,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "999px",
              transition: "all 0.2s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart */}
          {(!user || user.role === "user") && (
            <Link
              to="/cart"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                padding: "8px",
                color: textColor,
                textDecoration: "none",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
              }
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "#ff9a47",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    boxShadow: "0 2px 8px rgba(255, 132, 71, 0.5)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Dropdown */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.15)",
                  color: textColor,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
              >
                <User size={16} />
                <span
                  style={{
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName}
                </span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      zIndex: 999,
                    }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      width: "230px",
                      background: dropdownBg,
                      border: isDark
                        ? "1px solid rgba(252, 63, 25, 0.25)"
                        : "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "14px",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      padding: "8px",
                      boxShadow: isDark
                        ? "0 16px 48px rgba(0,0,0,0.6)"
                        : "0 16px 48px rgba(252, 112, 25, 0.15)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {user.role === "admin" ? (
                      <>
                        {[
                          { to: "/admin", label: "Dashboard" },
                          { to: "/admin/restaurants", label: "Restaurants" },
                          { to: "/admin/fooditems", label: "Food Items" },
                          { to: "/admin/orders", label: "Orders" },
                          { to: "/admin/users", label: "Users" },
                        ].map(({ to, label }) => (
                          <Link
                            key={to}
                            to={to}
                            style={{
                              padding: "10px 14px",
                              textDecoration: "none",
                              color: dropdownText,
                              borderRadius: "10px",
                              transition: "background 0.15s",
                              fontSize: "14px",
                            }}
                            onClick={() => setDropdownOpen(false)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(252,128,25,0.1)"
                                : "#FFF8F5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            {label}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          { to: "/profile", label: "My Profile" },
                          { to: "/orders", label: "Order History" },
                        ].map(({ to, label }) => (
                          <Link
                            key={to}
                            to={to}
                            style={{
                              padding: "10px 14px",
                              textDecoration: "none",
                              color: dropdownText,
                              borderRadius: "10px",
                              transition: "background 0.15s",
                              fontSize: "14px",
                            }}
                            onClick={() => setDropdownOpen(false)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(252,128,25,0.1)"
                                : "#FFF8F5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            {label}
                          </Link>
                        ))}
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "10px 14px",
                        color: "#ef6144",
                        borderRadius: "10px",
                        background: "transparent",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background 0.15s",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark
                          ? "rgba(85, 68, 239, 0.15)"
                          : "#fee2e2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                padding: "8px 24px",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#fc6c19",
                fontWeight: "800",
                textDecoration: "none",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
