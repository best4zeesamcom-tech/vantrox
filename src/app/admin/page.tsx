
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  quantity: number;
  message: string | null;
  unit_price: number;
  subtotal: number;
  delivery_fee: number | null;
  total_amount: number | null;
  status: string;
  payment_status: string;
  courier_name: string | null;
  tracking_number: string | null;
  created_at: string;
};

const statuses = [
  "pending",
  "confirmed",
  "dispatched",
  "delivered",
  "cancelled",
];

const paymentStatuses = ["unpaid", "paid", "refunded"];

function formatPrice(value: number | null) {
  if (value === null || value === undefined) return "Not confirmed";

  return `Rs. ${Number(value).toLocaleString("en-PK")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getWhatsAppLink(number: string) {
  let digits = number.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = `92${digits.slice(1)}`;
  }

  return `https://wa.me/${digits}`;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const loadOrders = useCallback(async () => {
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/admin/login");
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return;
    }

    const { data, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      setError(ordersError.message);
    } else {
      setOrders((data || []) as Order[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateOrder(
    id: string,
    updates: Partial<Order>
  ) {
    setSavingId(id);
    setError("");

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, ...updates } : order
        )
      );
    }

    setSavingId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const confirmedCount = orders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <p className="text-zinc-400">Loading VANTROX dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-[#101010]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-[0.18em]">
              VANTROX
            </h1>
            <p className="mt-1 text-xs tracking-[0.2em] text-zinc-500">
              ADMIN DASHBOARD
            </p>
          </div>

          <button
            onClick={logout}
            className="cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Orders Overview</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manage customer orders and deliveries.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
          >
            Refresh Orders
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Pending", value: pendingCount },
            { label: "Confirmed", value: confirmedCount },
            { label: "Delivered", value: deliveredCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-[#111] p-5"
            >
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="mt-3 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold">Customer Orders</h3>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-white/15 bg-[#151515] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="all">All Orders</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-[#111] px-5 py-16 text-center">
              <p className="text-lg text-zinc-300">No orders found</p>
              <p className="mt-2 text-sm text-zinc-500">
                Customer orders will appear here after submission.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <p className="text-xs text-zinc-500">
                        ORDER ID
                      </p>
                      <p className="mt-1 break-all text-sm font-medium">
                        {order.id}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">
                        {order.status}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-6 py-5 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-300">
                        Customer Information
                      </h4>

                      <p className="mt-3 text-lg font-semibold">
                        {order.customer_name}
                      </p>

                      <p className="mt-2 text-sm text-zinc-400">
                        WhatsApp: {order.whatsapp}
                      </p>

                      <a
                        href={getWhatsAppLink(order.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex cursor-pointer rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-black hover:bg-[#1fbd5b]"
                      >
                        Contact on WhatsApp
                      </a>

                      <p className="mt-5 text-sm font-medium text-zinc-300">
                        Delivery Address
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                        {order.address}
                      </p>

                      {order.message && (
                        <>
                          <p className="mt-5 text-sm font-medium text-zinc-300">
                            Customer Message
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">
                            {order.message}
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-300">
                        Order Summary
                      </h4>

                      <div className="mt-3 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">
                            Product
                          </span>
                          <span>M92 Style ToyGun Blaster</span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">
                            Quantity
                          </span>
                          <span>{order.quantity}</span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">
                            Unit Price
                          </span>
                          <span>{formatPrice(order.unit_price)}</span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">
                            Subtotal
                          </span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">
                            Delivery Fee
                          </span>
                          <span>{formatPrice(order.delivery_fee)}</span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-semibold">
                          <span>Total</span>
                          <span>
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs text-zinc-400">
                      Order Status
                      <select
                        value={order.status}
                        disabled={savingId === order.id}
                        onChange={(e) =>
                          updateOrder(order.id, {
                            status: e.target.value,
                          })
                        }
                        className="mt-2 w-full cursor-pointer rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs text-zinc-400">
                      Payment Status
                      <select
                        value={order.payment_status}
                        disabled={savingId === order.id}
                        onChange={(e) =>
                          updateOrder(order.id, {
                            payment_status: e.target.value,
                          })
                        }
                        className="mt-2 w-full cursor-pointer rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none"
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs text-zinc-400">
                      Courier Name
                      <input
                        key={`${order.id}-courier-${order.courier_name}`}
                        defaultValue={order.courier_name || ""}
                        placeholder="e.g. TCS, Leopards"
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-white/40"
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (order.courier_name || "")) {
                            updateOrder(order.id, {
                              courier_name: value || null,
                            });
                          }
                        }}
                      />
                    </label>

                    <label className="text-xs text-zinc-400">
                      Tracking Number
                      <input
                        key={`${order.id}-tracking-${order.tracking_number}`}
                        defaultValue={order.tracking_number || ""}
                        placeholder="Enter tracking number"
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-white/40"
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (order.tracking_number || "")) {
                            updateOrder(order.id, {
                              tracking_number: value || null,
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  {savingId === order.id && (
                    <p className="mt-3 text-xs text-zinc-500">
                      Saving changes...
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
