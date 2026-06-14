import { Spinner } from "./ui/Spinner";

/**
 * LoadingSpinner
 * Props:
 *   size     – "sm" | "md" (default) | "lg"
 *   label    – optional text below spinner
 *   inline   – render as small inline spinner (no label, no wrapper)
 */
export default function LoadingSpinner({ size = "md", label, inline = false }) {
  return <Spinner size={size} label={label} inline={inline} />;
}
