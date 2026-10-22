import { Router, useRoute } from "./router";
import { HomePage } from "../pages/Home/HomePage";
import { DetailsPage } from "../pages/Details/DetailsPage";
import { SupportPage } from "../pages/Support/SupportPage";
import { PaymentPage } from "../pages/Payment/PaymentPage";
import { Page3 } from "../pages/Page3/Page3";
import { Page4 } from "../pages/Page4/Page4";
import { Page5 } from "../pages/Page5/Page5";

function Routes() {
  const path = useRoute();

  switch (path) {
    case "/":
      return <HomePage />;
    case "/details":
      return <DetailsPage />;
    case "/support":
      return <SupportPage />;
    case "/payment":
      return <PaymentPage />;
    case "/page3":
      return <Page3 />;
    case "/page4":
      return <Page4 />;
    case "/page5":
      return <Page5 />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <Router>
      <a className="visually-hidden" href="#main">
        Skip to content
      </a>
      <Routes />
    </Router>
  );
}
