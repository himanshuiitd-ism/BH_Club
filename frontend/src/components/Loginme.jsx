import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/authSlice";
import store from "../redux/store";
import { Link } from "react-router-dom";

const Loginme = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8001/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          username: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response ? error.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="signup-box">
      <form onSubmit={loginHandler}>
        <div className="signup-heading">
          <h2>Login</h2>
          <p>Login to see photos and videos from your friends</p>
        </div>
        <div className="signup-body">
          <div className="signup-body-component">
            <span className="signup-component-name">Username</span>
            <br />
            <input
              type="text"
              name="username"
              className="signup-input"
              value={input.username}
              onChange={changeEventHandler}
            />
          </div>
          <div className="signup-body-component">
            <span className="signup-component-name">Password</span>
            <br />
            <input
              type="password"
              className="signup-input"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
            />
          </div>
        </div>
        <div className="signup-button">
          <button type="submit">
            {loading ? <>Please Wait...</> : "Login"}
          </button>

          <span>
            <Link to="" style={{ color: "blue", textDecoration: "none" }}>
              forgot Password ?
            </Link>
          </span>
          <br />
          <span>
            Doesn't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "blue", textDecoration: "none" }}
            >
              Signup
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Loginme;
