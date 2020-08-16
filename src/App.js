import React, { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import loginService from "./services/login";
import { Login } from "./components/Login";
import { Notification } from "./components/Notification";
import { BlogForm } from "./components/BlogForm";
import { Togglable } from "./components/Togglable";
import { useSource } from "./hooks/hooks";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [errMessage, setErrMessage] = useState(null);
  const blogFormRef = useRef();
  const [blogs, blogService] = useSource("/api/blogs");
  const localUser = JSON.parse(localStorage.getItem("loggedUser"));

  useEffect(() => {
    if (localUser) blogService.setToken(localUser.token);
  }, [localUser]);

  const errorStyle = {
    color: errMessage ? "rgb(255,0,0)" : undefined,
    margin: 5,
  };

  const addBlog = async (event, blog) => {
    event.preventDefault();
    blogFormRef.current.toggle();

    try {
      const res = await blogService.postBlog({ ...blog, user: user.id });

      if (res) {
        blogService.setBlogs(blogs.concat(res));
        // setAdded(true);

        // setBlogCreated(`a new blog ${res.title} by ${res.author}`);
      }
    } catch (error) {
      setTimeout(() => {
        setErrMessage(null);
      }, 5000);
      setErrMessage(error.response.data.error);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({ username, password });

      localStorage.setItem("loggedUser", JSON.stringify(user));
      setUser(user);
      setPassword("");
      setUsername("");
    } catch (error) {
      setErrMessage(error.response.data.error);

      setTimeout(() => {
        setErrMessage(null);
      }, 5000);
    }
  };

  const handleLogout = (event) => {
    event.preventDefault();

    localStorage.clear();
    setUser(null);
  };

  const onRemove = (event, id) => {
    event.preventDefault();

    const result = window.confirm("Are you sure you want to remove this blog?");

    if (result) {
      blogService
        .deleteBlog(id)
        .then(() => blogService.setBlogs(blogs.filter((b) => b.id !== id)))
        .catch((err) => setErrMessage(err.response.data.error));
    }
  };

  return (
    <div>
      <Notification style={errorStyle} messsage={errMessage} />
      {!user && (
        <div>
          <Login
            setPassword={setPassword}
            setUsername={setUsername}
            handleLogin={handleLogin}
          />
        </div>
      )}
      <h2>blogs</h2>
      {user && (
        <div>
          <p>{user.username} is logged-in</p>
          <button onClick={handleLogout}>Logout</button>
          {errMessage && (
            <Notification style={errorStyle} messsage={errMessage} />
          )}
          <Togglable label="Add New" ref={blogFormRef}>
            <h2>Create blog</h2>
            <BlogForm addBlog={addBlog} />
          </Togglable>
        </div>
      )}
      {blogs
        .sort((a, b) => a.likes - b.likes)
        .map((blog) => (
          <Blog onRemove={onRemove} key={blog.id} blog={blog} />
        ))}
    </div>
  );
};

export default App;
