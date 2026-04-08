import AuthGate from "@/components/AuthGate";

export const dynamic = "force-dynamic";

export default function LayoutPrivate({ children }) {
  return <AuthGate>{children}</AuthGate>;
}
