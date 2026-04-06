import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import bg2Image from "../assets/bg2.png";
import lpImage from "../assets/lpImage.jpeg";
import {
  CalendarDays,
  Wrench,
  ShieldCheck,
  BellRing,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

// Simplified Scroll Animation Hook for items below fold
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return [domRef, isVisible];
}

const FadeInSection = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation for above-the-fold content
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: (
        <CalendarDays className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      ),
      title: "Resource Booking",
      description:
        "Effortlessly reserve lecture halls, laboratories, and specialized equipment.",
    },
    {
      icon: <Wrench className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Maintenance Tracker",
      description:
        "Submit service tickets seamlessly and get rapid responses from technical staff.",
    },
    {
      icon: (
        <ShieldCheck className="h-8 w-8 text-teal-600 dark:text-teal-400" />
      ),
      title: "Admin Controls",
      description:
        "Streamline operations with powerful role management and oversight.",
    },
    {
      icon: <BellRing className="h-8 w-8 text-rose-600 dark:text-rose-400" />,
      title: "Real-time Updates",
      description:
        "Stay instantly updated regarding approvals, progress, and alerts.",
    },
  ];

  return (
    <div className="landing-page-shell min-h-screen font-sans text-slate-100 overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 transition-colors duration-300">
      <div
        className="landing-page-bg"
        style={{ backgroundImage: `url(${bg2Image})` }}
        aria-hidden="true"
      />
      <div className="landing-page-overlay" aria-hidden="true" />

      <div className="relative z-10">
        {/* Navbar section */}
        <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-[72px]">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20">
                  <GraduationCap
                    className="h-6 w-6 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-[1.35rem] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200 tracking-tight">
                  UniReserveHub
                </span>
              </div>
              <div className="hidden sm:flex gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white shadow-sm border border-white/20 transition-all hover:bg-white/20"
                >
                  Welcome Back
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {/* Reduced bottom padding to prevent feeling cut off visually, min-h applied carefully */}
        <div className="relative pt-[120px] pb-16 lg:pt-[140px] lg:pb-24 min-h-[92vh] flex items-center overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 dark:bg-blue-600/15 blur-[120px]" />
            <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/15 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* LEFT SIDE: Text and CTAs */}
              <div
                className={`col-span-1 lg:col-span-6 order-2 lg:order-1 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <h1 className="text-[2.75rem] leading-[1.1] sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold tracking-tight mb-5">
                  Simplifying{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                    Campus Management.
                  </span>{" "}
                  <br className="hidden md:block" />
                  <span className="text-[2rem] sm:text-4xl lg:text-4xl xl:text-5xl text-slate-200 font-bold mt-3 block leading-tight">
                    One Reservation at a Time.
                  </span>
                </h1>

                <p className="text-lg text-slate-200/90 mb-9 sm:mb-10 max-w-xl leading-relaxed">
                  Connect your entire campus ecosystem with a unified platform.
                  Streamline resource booking, maintenance requests, and
                  administrative controls while staying informed with real-time
                  notifications.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="group inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 text-base font-bold shadow-lg shadow-blue-600/30 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    Welcome Back
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-white/10 text-white px-8 py-4 text-base font-bold border border-white/20 shadow-sm transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-10 sm:mt-12 flex items-center gap-4 text-sm text-slate-300 font-medium">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
                        alt="User"
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
                        alt="User"
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden text-xs flex items-center justify-center font-bold bg-slate-800 text-white">
                      +5k
                    </div>
                  </div>
                  Trusted by modern universities
                </div>
              </div>

              {/* RIGHT SIDE: Campus Illustration / Image Feature */}
              <div
                className={`col-span-1 lg:col-span-6 order-1 lg:order-2 w-full transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isLoaded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-12"
                }`}
              >
                <div className="relative w-full max-w-lg mx-auto lg:max-w-none ml-auto">
                  {/* Floating Image Wrapper */}
                  <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(37,99,235,0.25)] border-[6px] border-white/80 dark:border-slate-800/80 bg-slate-100 animate-[translate-y_6s_ease-in-out_infinite_alternate]">
                    <img
                      src={lpImage}
                      alt="University Campus Modern System"
                      className="w-full h-auto object-cover aspect-[4/3] transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Decorative floating stats card */}
                  <div
                    className="absolute -left-6 lg:-left-12 bottom-12 z-20 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl shadow-[0_18px_40px_-20px_rgba(37,99,235,0.7)] border border-blue-100/80 dark:border-blue-500/25 flex items-center gap-4 animate-[translate-y_5s_ease-in-out_infinite_alternate_reverse]"
                    style={{ animationDelay: "1s" }}
                  >
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 p-3 rounded-full text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/30">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                        2,000+
                      </div>
                      <div className="text-xs text-blue-700/80 dark:text-blue-200/90 font-semibold mt-1 uppercase tracking-[0.08em]">
                        Bookings managed
                      </div>
                    </div>
                  </div>

                  {/* Decorative floating notification card */}
                  <div
                    className="absolute -right-4 lg:-right-8 top-12 z-20 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl shadow-[0_16px_34px_-18px_rgba(37,99,235,0.75)] border border-blue-100/80 dark:border-blue-500/25 flex items-center gap-3 animate-[translate-y_7s_ease-in-out_infinite_alternate]"
                    style={{ animationDelay: "2s" }}
                  >
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 p-2 rounded-full text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/30">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 pr-2 tracking-[0.04em]">
                      System Secure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Content (To demonstrate scroll) */}
        <div className="py-20 lg:py-28 bg-slate-950/55 border-y border-white/10 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInSection>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-blue-300 font-bold uppercase tracking-wider text-[0.8rem] mb-3">
                  Powerful Capabilities
                </h2>
                <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                  Everything you need to orchestrate campus life.
                </h3>
                <p className="text-lg text-slate-200/90 leading-relaxed">
                  A robust, intelligent suite of tools designed to remove
                  friction from daily academic and operational activities.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <FadeInSection key={index} delay={index * 120}>
                  <div className="bg-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/15 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-2 border border-white/20 h-full backdrop-blur-md">
                    <div className="bg-white/90 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 shadow-sm border border-white/30">
                      {feature.icon}
                    </div>
                    <h4 className="text-[1.3rem] font-bold text-white mb-2.5">
                      {feature.title}
                    </h4>
                    <p className="text-slate-200/90 leading-relaxed text-[0.95rem]">
                      {feature.description}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-950/85 border-t border-white/10 pt-16 pb-8 text-white backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/30">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  UniReserveHub
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  About Us
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Support
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact
                </a>
              </div>
            </div>
            <div className="text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
              <p>
                &copy; {new Date().getFullYear()} UniReserveHub Platform. All
                rights reserved.
              </p>
              <p className="mt-2 md:mt-0">
                Designed exclusively for Smart Campuses.
              </p>
            </div>
          </div>
        </footer>

        {/* Internal style for floating animations without bloating tailwind config */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
        @keyframes translate-y {
          0% { transform: translateY(0); }
          100% { transform: translateY(-15px); }
        }
      `,
          }}
        />
      </div>
    </div>
  );
}
