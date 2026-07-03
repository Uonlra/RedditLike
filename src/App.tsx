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
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <AuthLoading>
        <p>Still loading</p>
      </AuthLoading>
      <AuthRefreshing>
        <p>Refreshing token...</p>
      </AuthRefreshing>
    </main>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content: {messages?.length}</div>;
}

export default App;