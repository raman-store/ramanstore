import { useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
const ADMIN_EMAIL = "info@ramanstore.com";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function requestOtp() {
    setLoading(true); setMessage(""); setStep("otp");
    try {
      const response = await fetch(`${API_BASE}/admin/auth/request-otp`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: ADMIN_EMAIL }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP send nahi ho saka.");
      setMessage("OTP email par bheja ja raha hai.");
    } catch (error) { setStep("email"); setMessage(error instanceof Error ? error.message : "OTP send nahi ho saka."); }
    finally { setLoading(false); }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_BASE}/admin/auth/verify-otp`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: ADMIN_EMAIL, otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verify nahi hua.");
      onLogin();
    } catch (error) { setMessage(error instanceof Error ? error.message : "OTP verify nahi hua."); }
    finally { setLoading(false); }
  }

  return <main className="loginPage"><section className="loginCard">
    <img src="/ramanstore-final-logo-v5.png" alt="Raman Store" className="loginLogo" />
    <span className="loginEyebrow">SECURE ADMIN ACCESS</span><h1>Raman Store Admin</h1>
    {step === "email" ? <><p>Login OTP registered admin email par bheja jayega.</p><label>Admin email<input value={ADMIN_EMAIL} readOnly /></label><button className="loginPrimary" disabled={loading} onClick={requestOtp}>{loading ? "OTP bhej rahe hain…" : "Email OTP bhejein"}</button></> : <form onSubmit={verifyOtp}><p><strong>{ADMIN_EMAIL}</strong> par mila 6-digit OTP enter karein.</p><label>6-digit OTP<input className="otpInput" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} autoFocus required /></label><button className="loginPrimary" disabled={loading || otp.length !== 6}>{loading ? "Verify ho raha hai…" : "Secure login"}</button><button className="loginLink" type="button" disabled={loading} onClick={() => { setStep("email"); setOtp(""); setMessage(""); }}>OTP dobara bhejein</button></form>}
    {message && <div className={message.includes("bhej diya") ? "loginSuccess" : "errorMessage"}>{message}</div>}
    <small className="loginSecurity">OTP 10 minutes mein expire hota hai. Ise kisi ke saath share na karein.</small>
  </section></main>;
}
