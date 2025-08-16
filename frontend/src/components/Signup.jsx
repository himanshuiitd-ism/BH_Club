import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const SignUp = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signUpHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      //for api call
      const res = await axios.post(
        "https://bh-club.onrender.com/api/v1/user/register",
        input, //this is data
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      toast.error(error.response.data.message);
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
      <form onSubmit={signUpHandler}>
        <div className="signup-heading">
          <h2>Sign Up</h2>
          <p>Sign Up to see photos and videos from your friends</p>
        </div>
        <div className="signup-body">
          <div className="signup-body-component">
            <span className="signup-component-name">Username</span>
            <br />
            <input
              type="text"
              name="username" //name is use to identify the input
              className="signup-input"
              value={input.username}
              onChange={changeEventHandler}
            ></input>
          </div>
          <div className="signup-body-component">
            <span className="signup-component-name">Email</span>
            <br />
            <input
              type="email"
              name="email"
              className="signup-input"
              value={input.email}
              onChange={changeEventHandler}
            ></input>
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
            ></input>
          </div>
        </div>
        <div className="signup-button">
          <button type="submit">
            {loading ? <>Please Wait...</> : "Sign Up"}
          </button>
          <span>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "blue", textDecoration: "none" }}>
              Login
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
