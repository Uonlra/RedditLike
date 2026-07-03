import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SubmitPage from "./pages/SubmitPage";
import SubredditPage from "./pages/SubredditPage";
import PostPage from "./pages/postPage";


import { SignInButton, UserButton } from "@clerk/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  AuthRefreshing,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  return (
    <main>
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

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content: {messages?.length}</div>;
}

export default App;