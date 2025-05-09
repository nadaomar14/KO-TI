const payBtn = document.querySelector(".checkout-btn");

payBtn.addEventListener("click", async () => {
  try {
    // 1. Read the cart from localStorage
    const cartData = localStorage.getItem("cart");
    if (!cartData) {
      alert("Your cart is empty!");
      return;
    }

    const cartItems = JSON.parse(cartData);
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // 2. Disable the button while processing
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    // 3. Send cart items to the server to create a Stripe Checkout session
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          title: item.title,
          price: item.price,
          quantity: item.quantity
        }))
      })
    });

    // 4. Receive checkout URL from Stripe
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment failed");
    }

    if (!data.url) {
      throw new Error("Missing checkout URL");
    }

    // 5. Redirect the user to Stripe Checkout page
    window.location.href = data.url;

  } catch (error) {
    console.error("Checkout error:", error);
    alert(error.message || "Checkout failed. Please try again.");
    payBtn.disabled = false;
    payBtn.textContent = "Checkout";
  }
});
