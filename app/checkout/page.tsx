// app/checkout/page.tsx
export default function CheckoutPage() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p>
          This is where you would integrate your payment gateway (for example,
          Stripe) to process the order.
        </p>
        <p>For now, this page is just a placeholder.</p>
      </div>
    );
  }  