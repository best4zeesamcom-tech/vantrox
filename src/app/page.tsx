"use client";

import Image from "next/image";
import { useState, type MouseEvent, type FormEvent } from "react";
import {
  X,
  Minus,
  Plus,
  MessageCircle,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const productImages = [
  "/images/product-1.webp",
  "/images/product-2.webp",
  "/images/product-3.webp",
];

const PRODUCT_PRICE = 3000;
const MAX_QUANTITY = 10;

type OrderStatus = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const [activeImage, setActiveImage] = useState(0);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderError, setOrderError] = useState("");

  const subtotal = PRODUCT_PRICE * quantity;

  function handleZoomMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  function showPreviousImage() {
    setActiveImage((current) =>
      current === 0 ? productImages.length - 1 : current - 1
    );
  }

  function showNextImage() {
    setActiveImage((current) =>
      current === productImages.length - 1 ? 0 : current + 1
    );
  }

  function openOrderForm() {
    setOrderStatus("idle");
    setOrderError("");
    setIsOrderOpen(true);
  }

  function closeOrderForm() {
    if (orderStatus === "submitting") return;
    setIsOrderOpen(false);
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (orderStatus === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const customerName = String(formData.get("customerName") ?? "").trim();
    const whatsapp = String(formData.get("customerPhone") ?? "").trim();
    const address = String(formData.get("customerAddress") ?? "").trim();
    const message = String(formData.get("customerMessage") ?? "").trim();

    // Client-side checks. Database constraints and RLS remain authoritative.
    if (customerName.length < 3 || customerName.length > 100) {
      setOrderError("Please enter a name between 3 and 100 characters.");
      setOrderStatus("error");
      return;
    }

    if (whatsapp.length < 7 || whatsapp.length > 20) {
      setOrderError("Please enter a valid WhatsApp number.");
      setOrderStatus("error");
      return;
    }

    if (address.length < 8 || address.length > 500) {
      setOrderError("Please enter a complete delivery address.");
      setOrderStatus("error");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      setOrderError(`Quantity must be between 1 and ${MAX_QUANTITY}.`);
      setOrderStatus("error");
      return;
    }

    setOrderStatus("submitting");
    setOrderError("");

    try {
      // Customer orders are inserted as anonymous/public submissions.
      // Do not add .select() here: customers should not need permission to read orders.
      const { error } = await supabase.from("orders").insert({
        customer_name: customerName,
        whatsapp,
        address,
        quantity,
        message: message || null,
        unit_price: PRODUCT_PRICE,
        status: "pending",
        payment_method: "cash_on_delivery",
        payment_status: "unpaid",
      });

      if (error) {
        console.error("VANTROX order submission failed:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        setOrderError(
          `We couldn't submit your order: ${error.message} (Code: ${error.code || "unknown"}). Please try again.`
        );
        setOrderStatus("error");
        return;
      }

      setOrderStatus("success");
      form.reset();
      setQuantity(1);
    } catch (error) {
      console.error("Unexpected VANTROX order submission error:", error);

      setOrderError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setOrderStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#101315] text-[#f4f3ed]">
      {/* PAKISTAN DELIVERY BANNER */}
      <div className="bg-[#a1ad7c] px-3 py-2 text-center text-[10px] font-bold tracking-[1.5px] text-[#101315] sm:text-xs sm:tracking-[2px]">
        🇵🇰 DELIVERY AVAILABLE IN PAKISTAN ONLY
      </div>

      {/* NAVBAR */}
      <header className="border-b border-white/10">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-8">
          <a
            href="/"
            aria-label="VANTROX home"
            className="cursor-pointer text-xl font-black tracking-[4px] sm:text-2xl"
          >
            VANTROX<span className="text-[#a1ad7c]">.</span>
          </a>

          <span className="hidden text-xs font-medium tracking-[2px] text-gray-400 sm:block">
            PRECISION. PERFORMANCE. PLAY.
          </span>

          <span className="text-[10px] font-bold tracking-wider text-[#a1ad7c] sm:text-xs">
            PAKISTAN 🇵🇰
          </span>
        </nav>
      </header>

      {/* PRODUCT SECTION */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 lg:min-h-[calc(100svh-110px)] lg:grid-cols-2 lg:gap-12 lg:py-5">
        {/* IMAGE GALLERY */}
        <div className="w-full min-w-0">
          <div
            className={`group relative aspect-square w-full overflow-hidden border border-white/10 bg-[#1a1e20] sm:aspect-[5/4] lg:aspect-auto lg:h-[min(46svh,430px)] ${
              zoom ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleZoomMove}
          >
            <Image
              src={productImages[activeImage]}
              alt="M92 Style ToyGun Blaster"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-transform duration-300 ${
                zoom ? "scale-150" : "scale-100"
              }`}
              style={{ transformOrigin: zoomOrigin }}
            />

            {/* GALLERY NAVIGATION */}
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur-sm transition hover:bg-[#a1ad7c] hover:text-[#101315] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a1ad7c]"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur-sm transition hover:bg-[#a1ad7c] hover:text-[#101315] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a1ad7c]"
            >
              <ChevronRight size={22} />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-3 bg-black/70 px-3 py-2 text-[10px] tracking-[2px] text-white">
              IMAGE {activeImage + 1} / {productImages.length}
            </div>

            <div className="pointer-events-none absolute right-3 top-3 hidden bg-black/60 px-3 py-2 text-[10px] tracking-wider text-white/80 lg:block">
              MOVE CURSOR TO ZOOM
            </div>
          </div>

          {/* ORIGINAL PRODUCT IMAGE THUMBNAILS */}
          <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
            {productImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={activeImage === index}
                className={`relative aspect-square cursor-pointer overflow-hidden border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a1ad7c] ${
                  activeImage === index
                    ? "border-[#a1ad7c]"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 30vw, 150px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
            ))}
          </div>

          <p className="mt-2 text-center text-[10px] text-gray-500 sm:text-xs">
            Use the arrows or select a thumbnail to browse images
            <span className="hidden lg:inline">
              {" "}· Move your cursor over the main image to zoom
            </span>
          </p>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="flex min-w-0 flex-col py-2 lg:py-0">
          <span className="mb-3 text-[10px] font-bold tracking-[3px] text-[#a1ad7c] sm:text-xs">
            VANTROX EXCLUSIVE
          </span>

          <h1 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            M92 STYLE
            <br />
            TOYGUN BLASTER
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Black &amp; Silver Metallic Finish
          </p>

          {/* PRICE */}
          <div className="my-5 border-y border-white/10 py-4">
            <p className="text-[10px] font-semibold tracking-[2px] text-gray-500">
              PRODUCT PRICE
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold sm:text-4xl">
                Rs. 3,000
              </span>
              <span className="text-xs text-gray-500">PKR</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Delivery charges are separate and confirmed according to your
              location.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h2 className="mb-2 text-sm font-bold">Product Description</h2>
            <p className="text-xs leading-6 text-gray-400 sm:text-sm">
              M92 Style ToyGun Blaster featuring a black and silver
              metallic-finish appearance. Includes one free packet of silver
              metallic-finish plastic BBs.
            </p>
          </div>

          {/* FREE BONUS */}
          <div className="mt-4 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#a1ad7c]" />
            <div>
              <p className="text-xs font-semibold text-white">
                FREE BONUS INCLUDED
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                One packet of silver metallic-finish plastic BBs.
              </p>
            </div>
          </div>

          {/* DELIVERY INFORMATION */}
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <MapPin className="h-5 w-5 shrink-0 text-[#a1ad7c]" />
            <div>
              <p className="text-xs font-semibold text-white">
                Pakistan Delivery Only
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Delivery fee confirmed before order confirmation.
              </p>
            </div>
          </div>

          {/* BUY BUTTON */}
          <button
            type="button"
            onClick={openOrderForm}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 bg-[#a1ad7c] px-7 py-4 text-xs font-black tracking-[3px] text-[#101315] transition hover:bg-[#b6c292] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a1ad7c] sm:py-5 sm:text-sm"
          >
            BUY NOW
            <span className="text-lg">→</span>
          </button>

          <p className="mt-3 text-center text-[10px] text-gray-500">
            Your order will be confirmed after our team contacts you.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-[10px] text-gray-500 sm:flex-row sm:text-xs">
          <span className="font-bold tracking-[3px] text-white">VANTROX.</span>
          <span>Precision. Performance. Play.</span>
          <span>© 2026 VANTROX</span>
        </div>
      </footer>

      {/* ORDER MODAL */}
      {isOrderOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              orderStatus !== "submitting"
            ) {
              closeOrderForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className="relative my-auto max-h-[95svh] w-full max-w-xl overflow-y-auto border border-white/10 bg-[#191e1f] p-5 shadow-2xl sm:max-h-[90svh] sm:p-8"
          >
            <button
              type="button"
              onClick={closeOrderForm}
              disabled={orderStatus === "submitting"}
              aria-label="Close order form"
              className="absolute right-4 top-4 cursor-pointer p-2 text-gray-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={22} />
            </button>

            {orderStatus === "success" ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-16 w-16 text-[#a1ad7c]" />
                <span className="mt-6 text-[10px] font-bold tracking-[3px] text-[#a1ad7c]">
                  REQUEST RECEIVED
                </span>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Thank you!
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
                  Your order request has been submitted successfully. Our team
                  will contact you on WhatsApp to confirm availability and
                  delivery charges.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOrderOpen(false)}
                  className="mt-8 w-full cursor-pointer bg-[#a1ad7c] px-5 py-4 text-xs font-black tracking-[2px] text-[#101315] transition hover:bg-[#b6c292]"
                >
                  CONTINUE
                </button>
              </div>
            ) : (
              <>
                <span className="text-[10px] font-bold tracking-[3px] text-[#a1ad7c]">
                  VANTROX ORDER REQUEST
                </span>

                <h2
                  id="order-modal-title"
                  className="mt-3 text-2xl font-black sm:text-3xl"
                >
                  Place Your Order
                </h2>

                <p className="mt-2 pr-5 text-xs leading-6 text-gray-400">
                  Enter your details and our team will contact you to confirm
                  your order and delivery charges.
                </p>

                {/* PRODUCT SUMMARY */}
                <div className="my-5 flex items-center justify-between gap-3 border-y border-white/10 py-4">
                  <div>
                    <p className="text-xs font-bold sm:text-sm">
                      M92 Style ToyGun Blaster
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Black &amp; Silver Metallic Finish
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold">
                    Rs. 3,000
                  </span>
                </div>

                {/* CUSTOMER FORM */}
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="customerName"
                      className="mb-2 block text-[10px] font-bold tracking-wider text-gray-300"
                    >
                      FULL NAME
                    </label>
                    <input
                      id="customerName"
                      name="customerName"
                      type="text"
                      required
                      minLength={3}
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      disabled={orderStatus === "submitting"}
                      className="w-full border border-white/10 bg-[#101315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#a1ad7c] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="mb-2 block text-[10px] font-bold tracking-wider text-gray-300"
                    >
                      WHATSAPP NUMBER
                    </label>
                    <input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+92 3XX XXXXXXX"
                      pattern="(\+92|0092|0)?3[0-9]{9}"
                      title="Enter a valid Pakistani mobile number, e.g. 03001234567 or +923001234567"
                      disabled={orderStatus === "submitting"}
                      className="w-full border border-white/10 bg-[#101315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#a1ad7c] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerAddress"
                      className="mb-2 block text-[10px] font-bold tracking-wider text-gray-300"
                    >
                      DELIVERY ADDRESS
                    </label>
                    <textarea
                      id="customerAddress"
                      name="customerAddress"
                      required
                      minLength={8}
                      maxLength={500}
                      autoComplete="street-address"
                      rows={2}
                      placeholder="House, street, area and city"
                      disabled={orderStatus === "submitting"}
                      className="w-full resize-none border border-white/10 bg-[#101315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#a1ad7c] disabled:opacity-60"
                    />
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-wider text-gray-300">
                      QUANTITY
                    </label>
                    <div className="flex w-36 items-center justify-between border border-white/10 bg-[#101315]">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        disabled={quantity <= 1 || orderStatus === "submitting"}
                        aria-label="Decrease quantity"
                        className="cursor-pointer p-3 text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-bold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) =>
                            Math.min(MAX_QUANTITY, current + 1)
                          )
                        }
                        disabled={
                          quantity >= MAX_QUANTITY ||
                          orderStatus === "submitting"
                        }
                        aria-label="Increase quantity"
                        className="cursor-pointer p-3 text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Maximum {MAX_QUANTITY} items per order.
                    </p>
                  </div>

                  {/* OPTIONAL MESSAGE */}
                  <div>
                    <label
                      htmlFor="customerMessage"
                      className="mb-2 block text-[10px] font-bold tracking-wider text-gray-300"
                    >
                      ADDITIONAL MESSAGE (OPTIONAL)
                    </label>
                    <textarea
                      id="customerMessage"
                      name="customerMessage"
                      rows={2}
                      maxLength={1000}
                      placeholder="Any additional information..."
                      disabled={orderStatus === "submitting"}
                      className="w-full resize-none border border-white/10 bg-[#101315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#a1ad7c] disabled:opacity-60"
                    />
                  </div>

                  {/* PRICE BREAKDOWN */}
                  <div className="space-y-3 border-t border-white/10 pt-5 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Product price × {quantity}</span>
                      <span>Rs. {subtotal.toLocaleString("en-PK")}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Delivery charges</span>
                      <span>To be confirmed</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-4 text-sm font-bold">
                      <span>Product subtotal</span>
                      <span className="text-[#a1ad7c]">
                        Rs. {subtotal.toLocaleString("en-PK")}
                      </span>
                    </div>
                    <p className="text-[10px] leading-5 text-gray-500">
                      Delivery is available within Pakistan only. Final
                      delivery charges and payable amount will be confirmed
                      before your order is finalized.
                    </p>
                  </div>

                  {orderStatus === "error" && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-200"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={orderStatus === "submitting"}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 bg-[#a1ad7c] px-5 py-4 text-xs font-black tracking-[2px] text-[#101315] transition hover:bg-[#b6c292] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {orderStatus === "submitting" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        SUBMITTING ORDER...
                      </>
                    ) : (
                      <>
                        SUBMIT ORDER REQUEST
                        <MessageCircle size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] leading-5 text-gray-500">
                    Submitting this form requests contact about the order. It
                    does not complete payment or confirm delivery.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
