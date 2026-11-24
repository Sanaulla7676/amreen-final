import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { SiteSettingsInput } from '../backend/academy-validators.ts';
import {
  DEFAULT_SITE_SETTINGS,
  getPublicSiteSettings,
  listPublicTestimonials,
  signInWithGoogle,
  signOutUser,
  subscribeAuthState,
  testConnection,
  type TestimonialRecord,
} from '../backend/firebase-client.ts';
import { DEFAULT_TESTIMONIALS } from '../data/academyData.ts';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  connectionOk: boolean | null;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
  enquiryModalOpen: boolean;
  enquiryDefaultCourse: string;
  openEnquiryModal: (defaultCourse?: string) => void;
  closeEnquiryModal: () => void;
  siteSettings: SiteSettingsInput;
  testimonials: TestimonialRecord[];
  refreshPublicContent: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const ADMIN_PRIMARY_EMAIL = 'sanaullaa19@gmail.com';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryDefaultCourse, setEnquiryDefaultCourse] = useState(
    DEFAULT_SITE_SETTINGS.courseName
  );
  const [siteSettings, setSiteSettings] = useState<SiteSettingsInput>(DEFAULT_SITE_SETTINGS);
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>(DEFAULT_TESTIMONIALS);

  const refreshPublicContent = useCallback(async () => {
    const [nextSettings, nextTestimonials] = await Promise.all([
      getPublicSiteSettings(),
      listPublicTestimonials(),
    ]);
    setSiteSettings(nextSettings);
    if (nextTestimonials.length > 0) {
      setTestimonials(nextTestimonials);
    } else {
      setTestimonials(DEFAULT_TESTIMONIALS);
    }
  }, []);

  useEffect(() => {
    void testConnection().then(setConnectionOk);
    void refreshPublicContent();
    const unsubscribe = subscribeAuthState((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [refreshPublicContent]);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      authReady,
      connectionOk,
      signIn: signInWithGoogle,
      signOut: signOutUser,
      enquiryModalOpen,
      enquiryDefaultCourse,
      openEnquiryModal: (course?: string) => {
        if (course) setEnquiryDefaultCourse(course);
        setEnquiryModalOpen(true);
      },
      closeEnquiryModal: () => setEnquiryModalOpen(false),
      siteSettings,
      testimonials,
      refreshPublicContent,
    }),
    [
      user,
      authReady,
      connectionOk,
      enquiryModalOpen,
      enquiryDefaultCourse,
      siteSettings,
      testimonials,
      refreshPublicContent,
    ]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider.');
  }
  return ctx;
}
