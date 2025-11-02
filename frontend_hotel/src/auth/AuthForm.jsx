import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api"; // استدعاء functions من api.jsx
import "./AuthForm.css";

export default function AuthForm({ setIsAuthenticated, setRole }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    telephone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");

  // handle input
  const handleChange = (e, formType) => {
    if (formType === "login") {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    } else {
      setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    }
  };

  // submit login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(loginData);
      const { user, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      setIsAuthenticated(true);
      setRole(user.role);
      setMessage(`Welcome back ${user.name}`);

      // redirection selon le rôle
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "hotel") navigate("/hotel/rooms");
      else navigate("/profile");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  // submit register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        ...registerData,
        password_confirmation:
          registerData.password_confirmation || registerData.password,
      });
      setMessage("Account created! Please log in.");
      setIsSignUp(false); // basculer vers login
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div
        className={`container ${isSignUp ? "right-panel-active" : ""}`}
        id="container"
      >
        {/* Sign Up */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <span>or use your email for registration</span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={registerData.name}
              onChange={(e) => handleChange(e, "register")}
              required
            />
            <input
              type="number"
              name="telephone"
              placeholder="Telephone"
              value={registerData.telephone}
              onChange={(e) => handleChange(e, "register")}
              
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => handleChange(e, "register")}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => handleChange(e, "register")}
              required
            />
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              value={registerData.password_confirmation}
              onChange={(e) => handleChange(e, "register")}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* Sign In */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign in</h1>
            <span>or use your account</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleChange(e, "login")}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => handleChange(e, "login")}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login</p>
              <button className="ghost" onClick={() => setIsSignUp(false)} id="signIn">
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={() => setIsSignUp(true)} id="signUp">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {message && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
