import { supabase } from "../supabase/config";

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    console.log("User Logged In:", data.user);
    return data.user;
  } catch (error: any) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  } catch (error: any) {
    console.error("Google sign-in error:", error.message);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    console.log("User Signed Up:", data.user);
    return data.user;
  } catch (error: any) {
    console.error("Sign Up Error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("User Logged Out");
  } catch (error: any) {
    console.error("Logout Error:", error.message);
  }
};

// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";
// import { auth, provider } from "../firebase/config";

// export const login = async (email: string, password: string) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log("User Logged In:", userCredential.user);
//     return userCredential.user;
//   } catch (error: any) {
//     console.error("Login Error:", error.message);
//     throw error;
//   }
// };

// export const signInWithGoogle = async () => {
//   try {
//     await signInWithPopup(auth, provider);
//   } catch (error) {
//     console.error("Google sign-in error:", error);
//     throw error;
//   }
// };

// export const signUp = async (email: string, password: string) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log("User Signed Up:", userCredential.user);
//     return userCredential.user;
//   } catch (error: any) {
//     console.error("Sign Up Error:", error.message);
//     throw error;
//   }
// };

// export const logout = async () => {
//   try {
//     await signOut(auth);
//     console.log("User Logged Out");
//   } catch (error: any) {
//     console.error("Logout Error:", error.message);
//   }
// };
