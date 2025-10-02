// Simple cart implementation + Paystack integration
const cart = [];
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const yearEl = document.getElementById('year');
const payBtn = document.getElementById('pay-btn');
const emailInput = document.getElementById('customer-email');

yearEl.textContent = new Date().getFullYear();

function formatNaira(n){ return '₦' + n.toLocaleString(); }

function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach((it, i) => {
    const li = document.createElement('li');
    li.textContent = `${it.name} x ${it.qty} — ${formatNaira(it.price * it.qty)}`;
    cartItemsEl.appendChild(li);
    total += it.price * it.qty;
  });
  cartTotalEl.textContent = formatNaira(total);
}

// Add to cart buttons
const addBtns = document.querySelectorAll('.add-btn');
addBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-item');
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    const existing = cart.find(i => i.name === name);
    if(existing) existing.qty += 1;
    else cart.push({name, price, qty:1});
    renderCart();
  })
})

// Paystack checkout
payBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  if(!email){ alert('Please enter your email for receipt.'); return; }
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  if(total <= 0){ alert('Your cart is empty. Add some tasty food first!'); return; }

  // Paystack expects amount in kobo (Naira * 100)
  const amountKobo = total * 100;

  // NOTE: Replace `pk_test_xxxx` with your actual Paystack public key.
  // For production you must create a transaction on your server (initialize) and verify it server-side.
  const handler = PaystackPop.setup({
    key: 'pk_test_xxxx', // <-- REPLACE with your public key
    email: email,
    amount: amountKobo,
    currency: 'NGN',
    // metadata: optional, pass order details
    metadata: {
      custom_fields: [
        { display_name: 'Order details', variable_name: 'order', value: JSON.stringify(cart) }
      ]
    },
    onClose: function(){
      alert('Payment window closed. If you completed payment, confirm with your bank or contact us.');
    },
    callback: function(response){
      // response.reference
      alert('Payment completed! Reference: ' + response.reference + '\nPlease keep this for confirmation.');
      // TODO: verify transaction on your server using Paystack VERIFY endpoint, then clear cart / save order
      // Example: POST /verify-payment with response.reference
    }
  });
  handler.openIframe();
});

// Basic UX: clicking cart item to remove one quantity
cartItemsEl.addEventListener('click', (e) => {
  const text = e.target.textContent; // e.g. "Fried Rice & Chicken x 2 — ₦5,000"
  const name = text.split(' x ')[0];
  const idx = cart.findIndex(i=>i.name===name);
  if(idx>-1){
    cart[idx].qty -= 1;
    if(cart[idx].qty <= 0) cart.splice(idx,1);
    renderCart();
  }
});

// Initialize empty render
renderCart();
