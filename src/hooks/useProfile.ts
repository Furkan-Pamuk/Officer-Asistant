"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Profile } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    db.profile.get("me").then((p) => setProfile(p ?? null));
    const t = setInterval(() => db.profile.get("me").then((p) => setProfile(p ?? null)), 4000);
    return () => clearInterval(t);
  }, []);
  return profile;
}
