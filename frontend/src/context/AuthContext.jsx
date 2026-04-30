import { createContext, useContext, useState } from "react";
import { loginRequest } from "../api/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (credentials) => {
        const data = await loginRequest(credentials);

        if (data.token) {
            localStorage.setItem("token", data.token);
            setUser(data.user);
            return true;
        }

        return false;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};