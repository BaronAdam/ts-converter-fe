"use client";

import { FC, ReactNode } from "react";

type CollapsibleProps = {
  open: boolean;
  /** Extra classes for the padded inner box (use padding, not margin, for spacing). */
  className?: string;
  children: ReactNode;
};

/**
 * Animates its height and opacity instead of mounting/unmounting, so
 * neighbouring content glides rather than jumps. The content stays in the DOM
 * while closed (so it can be seen collapsing) but is hidden from assistive
 * technology and made inert, so it can't be focused or clicked.
 */
const Collapsible: FC<CollapsibleProps> = ({ open, className = "", children }) => (
  <div
    aria-hidden={!open}
    inert={!open}
    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`}
  >
    <div className="min-h-0 overflow-hidden">
      <div className={className}>{children}</div>
    </div>
  </div>
);

export default Collapsible;
