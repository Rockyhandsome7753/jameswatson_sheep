import type { ReactNode } from "react";
import { LOGO } from "../../img/images";
import { IconChevronRight } from "../ui/Icon";
import { useGoBack } from "../../app/router";
import "./AppHeader.css";

export interface AppHeaderProps {
  /** Show a back button instead of the logo (used on inner screens). */
  back?: boolean;
  title?: string;
  /** Right-aligned action slot. */
  action?: ReactNode;
}

export function AppHeader({ back = false, title, action }: AppHeaderProps) {
  const goBack = useGoBack();

  return (
    <header className="app-header">
      {back ? (
        <button
          className="app-header__back"
          type="button"
          onClick={() => goBack("/")}
          aria-label="Go back"
        >
          <IconChevronRight size={22} />
        </button>
      ) : (
        <span className="app-header__brand">
          <img className="app-header__logo" src={LOGO} alt="" />
          <span className="app-header__name">
            Paytm <b>Gateway</b>
          </span>
        </span>
      )}

      {title && <h1 className="app-header__title">{title}</h1>}

      <div className="app-header__action">{action}</div>
    </header>
  );
}
