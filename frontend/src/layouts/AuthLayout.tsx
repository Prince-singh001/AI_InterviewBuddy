import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="auth-layout-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#E3F2FD",
        color: "#0D47A1",
        overflow: "hidden",
      }}
    >
      {/* Left branding section */}
      <div
        className="auth-layout-brand"
        style={{
          width: "50%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0D47A1 0%, #2196F3 55%, #90CAF9 100%)",
          color: "#ffffff",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: "-100px",
            right: "-100px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            bottom: "-70px",
            left: "-70px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "560px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              color: "#2196F3",
              marginBottom: "28px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            }}
          >
            <Bot size={32} strokeWidth={2.2} />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 4vw, 58px)",
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-1.5px",
            }}
          >
            AI Interview
            <br />
            Buddy
          </h1>

          <p
            style={{
              marginTop: "24px",
              marginBottom: 0,
              maxWidth: "480px",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Practice interviews, improve your answers, and build confidence with
            an AI-powered interview preparation partner.
          </p>

          {/* Features */}
          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "38px",
            }}
          >
            {[
              "AI-powered interview practice",
              "Role-based interview preparation",
              "Personalized feedback and insights",
              "Track your interview progress",
            ].map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    flexShrink: 0,
                  }}
                />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right authentication section */}
      <div
        className="auth-layout-form"
        style={{
          width: "50%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background: "#ffffff",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: "100%",
            maxWidth: "460px",
          }}
        >
          {children}
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 900px) {
            .auth-layout-shell {
              flex-direction: column !important;
            }

            .auth-layout-brand {
              width: 100% !important;
              min-height: auto !important;
              padding: 48px 28px !important;
            }

            .auth-layout-form {
              width: 100% !important;
              min-height: auto !important;
              padding: 40px 24px !important;
            }
          }

          @media (max-width: 520px) {
            .auth-layout-brand {
              padding: 36px 22px !important;
            }

            .auth-layout-form {
              padding: 32px 18px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
