import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Card } from "../../components/ui/Card";
import { IconClock, IconUsers, IconCheck } from "../../components/ui/Icon";
import "./Support.css";

const CHANNELS = [
  {
    icon: <IconClock size={18} />,
    title: "Call us",
    detail: "+91 98765 43210",
    note: "Mon–Sat, 9am–7pm",
  },
  {
    icon: <IconUsers size={18} />,
    title: "Email support",
    detail: "help@paytmgateway.com",
    note: "Replies within 4 hours",
  },
  {
    icon: <IconCheck size={18} />,
    title: "WhatsApp",
    detail: "+91 98765 43210",
    note: "Fastest response",
  },
];

export function SupportPage() {
  return (
    <AppLayout title="Support">
      <div className="m-support">
        <p className="m-support__intro">
          Need help? Reach us through any of these channels — a real person will
          assist you.
        </p>

        <div className="m-support__list">
          {CHANNELS.map((c) => (
            <Card key={c.title} className="m-support__card">
              <span className="m-support__icon">{c.icon}</span>
              <div className="m-support__body">
                <p className="m-support__title">{c.title}</p>
                <p className="m-support__detail">{c.detail}</p>
                <p className="m-support__note">{c.note}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
