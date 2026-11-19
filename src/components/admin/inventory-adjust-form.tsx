import { InventoryReason } from "@prisma/client";
import { adjustInventory } from "@/actions/admin-inventory";

export function InventoryAdjustForm({ variantId, stock }: { variantId: string; stock: number }) {
  return <form action={adjustInventory} className="admin-inventory-form"><input type="hidden" name="variantId" value={variantId}/><input aria-label="New stock quantity" type="number" name="stockQuantity" min="0" max="1000000" defaultValue={stock}/><select aria-label="Adjustment reason" name="reason" defaultValue="ADJUSTMENT">{Object.values(InventoryReason).filter((reason) => reason !== "SALE").map((reason) => <option key={reason} value={reason}>{reason.toLowerCase()}</option>)}</select><input aria-label="Adjustment note" name="note" maxLength={300} placeholder="Note (optional)"/><button className="admin-secondary-button compact">Save</button></form>;
}
