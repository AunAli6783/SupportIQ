# Phase 03: Embedded Floating AI Widget & Global Website Context

> **Phase Status:** Planned  
> **Prerequisites:** Phase 01 & Phase 02 Completed (Storefront and Store API operational)  
> **Target Outcome:** A modern, global floating AI shopping & support widget ("Nova AI") embedded seamlessly into the Next.js e-commerce storefront, equipped with browser page context awareness, live cart inspection, and real-time streaming chat.

---

## 1. Objective

Embed SupportIQ as an interactive floating widget across all pages of the NovaCart e-commerce website. When a customer opens the widget, it automatically captures their **current browsing context** (the active product being viewed, cart contents, and authenticated user ID), allowing the AI to answer context-rich questions like *"Does this have a warranty?"* or *"Can you check if this is in stock?"* without requiring the customer to repeat product names.

---

## 2. Floating AI Widget Blueprint

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  NOVACART STOREFRONT                                                        │
 │                                                                             │
 │  Home   Laptops   Smartphones   Accessories             Cart [ 2 ]   👤 Ali │
 │  ─────────────────────────────────────────────────────────────────────────  │
 │  [ NovaBook Pro 14 — Intel Core Ultra 7 ]                                   │
 │  Price: 285,000 PKR | Stock: 12 Units Available                             │
 │                                                        ┌──────────────────┐ │
 │  [ Specifications Table ]                              │  🤖 Nova AI   ×  │ │
 │  • RAM: 32GB LPDDR5X                                   ├──────────────────┤ │
 │  • Storage: 1TB NVMe SSD                               │ Hi Ali! I see    │ │
 │  • Display: 14.5" 2.8K OLED 120Hz                      │ you're viewing   │ │
 │                                                        │ the NovaBook     │ │
 │  [ Add to Cart ]   [ Buy Now ]                         │ Pro 14.          │ │
 │                                                        │                  │ │
 │                                                        │ 👤: Does this    │ │
 │                                                        │ have a warranty? │ │
 │                                                        │                  │ │
 │                                                        │ 🤖: Yes! It has  │ │
 │                                                        │ 2-year official  │ │
 │                                                        │ warranty.        │ │
 │                                                        ├──────────────────┤ │
 │                                                        │ Type message.. ➤ │ │
 │                                                        └──────────────────┘ │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Global Website Context Bridge

The widget automatically collects and transmits active browser state with every message:

```typescript
// frontend/components/ai/FloatingAiWidget.tsx
interface PageContext {
  current_path: string;            // e.g. "/products/P-1001"
  viewing_product_id?: string;     // e.g. "P-1001"
  viewing_product_name?: string;   // e.g. "NovaBook Pro 14"
  cart_item_count: number;         // e.g. 2
  cart_total_pkr: number;          // e.g. 285000
  customer_id?: string;            // e.g. "CUS-102"
}

// Payload transmitted to FastAPI:
const payload = {
  message: userQuery,
  conversation_id: activeSessionId,
  customer_id: authUser?.id,
  page_context: {
    current_path: pathname,
    viewing_product_id: currentProduct?.id,
    viewing_product_name: currentProduct?.name,
    cart_item_count: cart.items.length,
    cart_total_pkr: cart.totalAmount
  }
};
```

---

## 4. Dynamic Context-Aware Quick Action Suggestions

The widget adapts its suggested question chips based on the active page:

| Customer's Active Page | Dynamic Quick Action Chips |
| :--- | :--- |
| **Storefront Home (`/`)** | *"Where is my order?"*, *"Best gaming laptops"*, *"What is your return policy?"* |
| **Product Detail (`/products/[id]`)** | *"Does this have a warranty?"*, *"Is this in stock?"*, *"Calculate 10% discount on this"* |
| **Cart / Checkout (`/cart`)** | *"What are your shipping times?"*, *"Can I pay via Cash on Delivery?"* |
| **Order History (`/orders`)** | *"Track order NC-10003"*, *"How do I return an item?"*, *"Download sales invoice"* |

---

## 5. UI Features & Polish

1. **Floating Trigger Button:** Circular launcher with subtle pulsing glow, unread message badges, and smooth expand animation.
2. **Glassmorphism Theme:** Dark executive slate (`bg-slate-950/95`) with cyan/indigo accent borders.
3. **Interactive Domain Citations:** Clickable badges (`🌐 reuters.com`, `📄 Warranty Policy`) opening in new tabs.
4. **Instant Action Execution:** In-chat buttons for *"📥 Download Presentation (.pptx)"*, *"Cancel Order"*, or *"Request Return"*.

---

## 6. Phase Checklist

- [ ] Implement `FloatingAiWidget.tsx` React component in `frontend/components/ai/`.
- [ ] Embed widget globally in `frontend/app/layout.tsx`.
- [ ] Implement page context extractor reading Next.js router path and `CartContext`.
- [ ] Add dynamic contextual quick-action chips for Home, Product, Cart, and Order pages.
- [ ] Connect widget to FastAPI `/api/v1/chat` endpoint with context payload.
- [ ] Test context awareness (e.g. asking *"Does this have a warranty?"* on a laptop page).
