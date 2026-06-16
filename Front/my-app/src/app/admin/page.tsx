import type { Metadata } from "next";
import AdminProducts from "./AdminProducts";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <AdminProducts />;
}
