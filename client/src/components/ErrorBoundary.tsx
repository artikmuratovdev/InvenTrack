import { Component, type ReactNode } from "react";
import { btnPrimary } from "./ui";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold">Sahifani ko'rsatishda xatolik yuz berdi</p>
        <button className={`${btnPrimary} mt-4`} onClick={() => window.location.reload()}>Qayta yuklash</button>
      </div>
    );
  }
}
