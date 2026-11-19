import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <main className="policy-page"><div className="breadcrumb"><Link href="/">HOME</Link><span>/</span><span>TERMS & CONDITIONS</span></div><article className="policy-content"><span className="eyebrow">WORLD ORGANIC BAZAR</span><h1>Terms & <em>conditions.</em></h1><p className="policy-draft">These terms require owner approval and confirmation of the delivery and returns policies before launch.</p><h2>Orders</h2><p>Submitting an order creates a request for the listed products. The Bazar should confirm availability and delivery details with the customer before fulfilment.</p><h2>Prices and availability</h2><p>Prices, weights, and stock are shown for each product variation. The server checks current price and stock when an order is submitted.</p><h2>Cash on Delivery</h2><p>Cash on Delivery is the only active payment option in this build. Any online payment option will remain unavailable until a provider integration is configured and verified.</p><h2>Delivery, returns, and support</h2><p>Delivery charges and service areas are managed in the dashboard. Final delivery and return rules must be published by the business. Contact details are available on the <Link href="/contact">contact page</Link> when configured.</p></article></main>;
}
