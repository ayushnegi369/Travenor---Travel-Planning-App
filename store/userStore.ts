import { create } from "zustand";

const useUserStore = create((set) => ({
    email: "",
    username: "",
    jwtToken: "",

    // ✅ Set individual fields
    setEmail: (email) => set({ email }),
    setUsername: (username) => set({ username }),
    setJwtToken: (token) => set({ jwtToken: token }),

    // ✅ Set all user info at once
    setUserInfo: ({ email, username, jwtToken }) =>
        set({ email, username, jwtToken }),

    // ✅ Reset all fields (e.g., on logout)
    resetUser: () => set({ email: "", username: "", jwtToken: "" }),
}));

export default useUserStore;
