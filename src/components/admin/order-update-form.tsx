import { OrderStatus, PaymentStatus } from "@prisma/client";
import { updateOrder } from "@/actions/admin-orders";

export function OrderUpdateForm({ orderId, status, paymentStatus, note = "" }: { orderId: string; status: OrderStatus; paymentStatus: PaymentStatus; note?: string }) {
  return <form action={updateOrder} className="admin-form admin-order-update">
    <input type="hidden" name="orderId" value={orderId} />
    <label className="admin-field"><span>Order status</span><select name="status" defaultValue={status}>{Object.values(OrderStatus).map((value) => <option key={value} value={value}>{value.toLowerCase()}</option>)}</select></label>
    <label className="admin-field"><span>Payment status</span><select name="paymentStatus" defaultValue={paymentStatus}>{Object.values(PaymentStatus).map((value) => <option key={value} value={value}>{value.toLowerCase()}</option>)}</select></label>
    <label className="admin-field admin-field-full"><span>Internal note</span><textarea name="note" rows={3} maxLength={1000} defaultValue={note} placeholder="Add an internal order note" /></label>
    <button className="admin-primary-button">Save order update</button>
  </form>;
}
