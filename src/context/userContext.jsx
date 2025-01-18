import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync();

export const UserContext = createContext({
	user: null,
	session: null,
	initialized: false,
	signUp: async () => {},
	signInWithPassword: async () => {},
	signOut: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [initialized, setInitialized] = useState(false);

	// Initialize auth state
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();
				setSession(session);
				setUser(session?.user || null);
				
				// Subscribe to auth changes
				const { data: { subscription } } = supabase.auth.onAuthStateChange(
					(_event, session) => {
						setSession(session);
						setUser(session?.user || null);
					}
				);

				setInitialized(true);
				setTimeout(() => {
					SplashScreen.hideAsync();
				}, 500);

				return () => subscription.unsubscribe();
			} catch (error) {
				console.error("Error initializing auth:", error);
				setInitialized(true);
			}
		};

		initializeAuth();
	}, []);

	const signUp = async (email, password) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
		});
		if (error) throw error;
	};

	const signInWithPassword = async (email, password) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	};

	return (
		<UserContext.Provider
			value={{
				user,
				session,
				initialized,
				signUp,
				signInWithPassword,
				signOut,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
