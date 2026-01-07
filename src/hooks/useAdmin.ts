import { useUser } from "@clerk/clerk-react";

const ADMIN_EMAIL = "mike.cann@gmail.com";

export function useAdmin() {
  const { user, isLoaded } = useUser();

  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  return { isAdmin, isLoaded };
}
