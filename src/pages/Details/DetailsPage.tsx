import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Button } from "../../components/ui/Button";
import { IconCheck } from "../../components/ui/Icon";
import { useNavigate } from "../../app/router";
import "./Details.css";

/** Reads the lead captured on page 1, if the browser allows session storage. */
function readLead(): { fullName?: string; mobile?: string } {
  try {
    const raw = sessionStorage.getItem("rg:lead");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function DetailsPage() {
  const navigate = useNavigate();
  const lead = readLead();

  return (
    <AppLayout title="Details">
      <div className="m-details">
        <span className="m-details__badge">
          <IconCheck size={15} />
          Step 1 complete
        </span>

        <h2 className="m-details__title">Page 2</h2>
        <p className="m-details__text">
          Your details were received. This screen is a placeholder — tell me what
          belongs here and I'll build it next.
        </p>

        <dl className="m-details__recap">
          <div className="m-details__row">
            <dt>Full name</dt>
            <dd>{lead.fullName || "—"}</dd>
          </div>
          <div className="m-details__row">
            <dt>Mobile number</dt>
            <dd>{lead.mobile ? `+91 ${lead.mobile}` : "—"}</dd>
          </div>
        </dl>

        <Button variant="outline" block onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    </AppLayout>
  );
}
