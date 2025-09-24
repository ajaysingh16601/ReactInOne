import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import AppRoutes from "../routes/AppRoutes";
import ThemeProvider from "../providers/ThemeProvider";
import AuthProvider from "../providers/AuthProvider";

const App = () => {
    return (
        <Provider store={store}>
        <Router>
            <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
            </ThemeProvider>
        </Router>
        </Provider>
    );
};

export default App;
