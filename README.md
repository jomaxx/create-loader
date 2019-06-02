# create-loader

Data Fetching for React Suspense

## Install

```bash
# npm
npm install --save @jomaxx/create-loader react
```

```bash
# yarn
yarn add @jomaxx/create-loader react
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { createLoader } from "@jomaxx/create-loader";

const [LoadUser, useUser] = createLoader(
  // fetch json from api
  ({ id }) => fetch(`/api/users/${id}`).then(response => response.json()),
  // reload when id changes
  ({ id }) => [id]
);

function Greetings() {
  const user = useUser(); // gets user from context
  return <h1>Hello {user.name}!</h1>;
}

function App() {
  return (
    // shows fallback while user is loading
    <React.Suspense fallback={<h1>Loading...</h1>}>
      <LoadUser id={2}>
        <Greetings />
      </LoadUser>
    </React.Suspense>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```
