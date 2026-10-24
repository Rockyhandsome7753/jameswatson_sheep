import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { LeadForm } from "../../features/lead/LeadForm";
import { IconCheck, IconClock, IconUsers } from "../../components/ui/Icon";
import { useNavigate } from "../../app/router";
import type { LeadValues } from "../../features/lead/validation";
import "./Home.css";

const TRUST = [
  { icon: <IconCheck size={15} />, label: "Verified" },
  { icon: <IconClock size={15} />, label: "24×7 support" },
  { icon: <IconUsers size={15} />, label: "12,000+ users" },
];

export function HomePage() {
  const navigate = useNavigate();

  const handleSubmit = (values: LeadValues) => {
    try {
      sessionStorage.setItem("rg:lead", JSON.stringify(values));
    } catch {}
    navigate("/card");
  };

  return (
    <AppLayout>
      <div className="m-home">
        <Banner />

        <section className="m-home__card" aria-labelledby="register-heading">
          <header className="m-home__head">
            <h2 className="m-home__title" id="register-heading">
              Get started
            </h2>
            <p className="m-home__sub">
              Enter your details and our team will contact you shortly.
            </p>
          </header>

          <LeadForm onSubmit={handleSubmit} />

          <ul className="m-home__trust">
            {TRUST.map((t) => (
              <li className="m-home__trust-item" key={t.label}>
                <span className="m-home__trust-icon">{t.icon}</span>
                {t.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="m-home__points" aria-label="Why Paytm Gateway">
          <h2 className="m-home__points-title">Why Paytm Gateway</h2>
          <ul>
            <li className="m-home__point">
              <span className="m-home__point-num">01</span>
              <div>
                <p className="m-home__point-title">Fast onboarding</p>
                <p className="m-home__point-text">
                  Submit your details and get activated the same day.
                </p>
              </div>
            </li>
            <li className="m-home__point">
              <span className="m-home__point-num">02</span>
              <div>
                <p className="m-home__point-title">Secure by default</p>
                <p className="m-home__point-text">
                  Your information is encrypted and never shared.
                </p>
              </div>
            </li>
            <li className="m-home__point">
              <span className="m-home__point-num">03</span>
              <div>
                <p className="m-home__point-title">Real human support</p>
                <p className="m-home__point-text">
                  Talk to a specialist any time, in your language.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
