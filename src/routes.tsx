import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes as Switch,
} from "react-router-dom";
import Home from "./features/Home";
import Ingest from "./features/Ingest";
import Stream from "./features/Stream";

export const Routes = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/ingest">Ingest</Link>
            </li>
            <li>
              <Link to="/stream">Stream</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ingest" element={<Ingest />} />
          <Route path="/stream" element={<Stream />} />
        </Switch>
      </div>
    </Router>
  );
};
