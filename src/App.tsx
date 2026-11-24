import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { EnquiryDialog } from './components/EnquiryDialog.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { FirebaseProvider } from './context/FirebaseContext.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { BlogPage } from './pages/BlogPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CourseDetailPage } from './pages/CourseDetailPage.tsx';
import { CoursesPage } from './pages/CoursesPage.tsx';
import { FacultyPage } from './pages/FacultyPage.tsx';
import { FaqsPage } from './pages/FaqsPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { StudentSuccessPage } from './pages/StudentSuccessPage.tsx';
import { VerifyPage } from './pages/VerifyPage.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <FirebaseProvider>
          <BrowserRouter>
            <ScrollToTop />
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <Navbar />
            <main id="main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/index.html" element={<Navigate to="/" replace />} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/about.html" element={<Navigate to="/about" replace />} />

                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses.html" element={<Navigate to="/courses" replace />} />

                <Route
                  path="/45-day-course"
                  element={<CourseDetailPage mode="40-day" />}
                />
                <Route
                  path="/45-day-course.html"
                  element={<Navigate to="/45-day-course" replace />}
                />

                <Route
                  path="/professional-makeup"
                  element={<CourseDetailPage mode="professional-makeup" />}
                />
                <Route
                  path="/professional-makeup.html"
                  element={<Navigate to="/professional-makeup" replace />}
                />

                <Route
                  path="/skin-aesthetics"
                  element={<CourseDetailPage mode="skin-aesthetics" />}
                />
                <Route
                  path="/skin-aesthetics.html"
                  element={<Navigate to="/skin-aesthetics" replace />}
                />

                <Route
                  path="/hair-styling"
                  element={<CourseDetailPage mode="hair-styling" />}
                />
                <Route
                  path="/hair-styling.html"
                  element={<Navigate to="/hair-styling" replace />}
                />

                <Route
                  path="/bridal-artistry"
                  element={<CourseDetailPage mode="bridal-artistry" />}
                />
                <Route
                  path="/bridal-artistry.html"
                  element={<Navigate to="/bridal-artistry" replace />}
                />

                <Route path="/faculty" element={<FacultyPage />} />
                <Route path="/faculty.html" element={<Navigate to="/faculty" replace />} />

                <Route path="/student-success" element={<StudentSuccessPage />} />
                <Route
                  path="/student-success.html"
                  element={<Navigate to="/student-success" replace />}
                />

                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog.html" element={<Navigate to="/blog" replace />} />

                <Route path="/faqs" element={<FaqsPage />} />
                <Route path="/faqs.html" element={<Navigate to="/faqs" replace />} />

                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact.html" element={<Navigate to="/contact" replace />} />

                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/verify.html" element={<Navigate to="/verify" replace />} />

                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
                <Route path="/crm" element={<AdminPage />} />
                <Route path="/crm.html" element={<Navigate to="/crm" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <EnquiryDialog />
            <FloatingWhatsApp />
          </BrowserRouter>
        </FirebaseProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
