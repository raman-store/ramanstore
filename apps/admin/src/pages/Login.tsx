import { useState } from "react";
import { API_BASE } from "../lib/apiBase";

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
      if (!response.ok) throw new Error(data.message || "The verification code could not be sent.");
      setMessage("A verification code has been sent to the registered email address.");
    } catch (error) { setStep("email"); setMessage(error instanceof Error ? error.message : "The verification code could not be sent."); }
    finally { setLoading(false); }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_BASE}/admin/auth/verify-otp`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: ADMIN_EMAIL, otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The verification code could not be confirmed.");
      onLogin();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The verification code could not be confirmed."); }
    finally { setLoading(false); }
  }

  return <main className="loginPage"><section className="loginCard">
    <img src="/ramanstore-final-logo-v5.png" alt="Raman Store" className="loginLogo" />
    <span className="loginEyebrow">SECURE ADMIN ACCESS</span><h1>Raman Store Admin</h1>
    {step === "email" ? <><p>A one-time verification code will be sent to the registered administrator email address.</p><label>Administrator email<input value={ADMIN_EMAIL} readOnly /></label><button className="loginPrimary" disabled={loading} onClick={requestOtp}>{loading ? "Sending code…" : "Send verification code"}</button></> : <form onSubmit={verifyOtp}><p>Enter the six-digit verification code sent to <strong>{ADMIN_EMAIL}</strong>.</p><label>Six-digit code<input className="otpInput" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} autoFocus required /></label><button className="loginPrimary" disabled={loading || otp.length !== 6}>{loading ? "Verifying…" : "Secure login"}</button><button className="loginLink" type="button" disabled={loading} onClick={() => { setStep("email"); setOtp(""); setMessage(""); }}>Resend verification code</button></form>}
    {message && <div className={message.includes("has been sent") ? "loginSuccess" : "errorMessage"}>{message}</div>}
    <small className="loginSecurity">The verification code expires after 10 minutes. Do not share it with anyone.</small>
  </section></main>;
}
