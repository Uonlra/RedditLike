import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SubmitPage from "./pages/SubmitPage";
import SubredditPage from "./pages/SubredditPage";
import PostPage from "./pages/postPage";
import ResponsiveDemo from "./ResponsiveDemo";

function App() {
  return (
    <main>
      <ResponsiveDemo />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="u/:username" element={<ProfilePage />} />
            <Route path="r/:subredditName" element={<SubredditPage />} />
            <Route path="r/:subredditName/submit" element={<SubmitPage />} />
            <Route path="post/:postId" element={<PostPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;