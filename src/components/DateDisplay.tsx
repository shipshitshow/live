"use client";

import { useState, useEffect } from "react";

export function DateDisplay() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
  }, []);

  return (
    <span className="text-xs text-text-muted font-mono">
      {date}
    </span>
  );
}
