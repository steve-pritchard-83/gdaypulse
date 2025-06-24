"use client";

import * as React from "react";
import styles from "./Progress.module.css";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number | null }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`${styles.progressRoot} ${className}`}
    {...props}
  >
    <div
      className={styles.progressIndicator}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress }; 