declare module "../firebase" {
	import type { Auth } from "firebase/auth";
	import type { Database } from "firebase/database";
	export const auth: Auth;
	export const db: Database;
}
