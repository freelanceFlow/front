"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storageService } from "@/services/storage.service";
import { User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const currentUser = storageService.getUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const logout = () => {
    storageService.clear();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return {
    user,
    isLoading,
    isAuthenticated: storageService.isAuthenticated(),
    logout,
  };
}