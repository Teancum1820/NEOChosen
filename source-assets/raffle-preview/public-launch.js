// Preview interactions only. There are no requests, purchaser fields, or entries.
const ticketDialog = document.getElementById('cash-checkout-preview');
const notesDialog = document.getElementById('cash-review-notes');
for (const button of document.querySelectorAll('[data-ticket-option]')) {
  button.addEventListener('click', () => {
    const entries = button.dataset.ticketOption;
    document.getElementById('cash-selected-tickets').textContent = `${entries} raffle ${entries === '1' ? 'ticket' : 'tickets'}`;
    document.getElementById('cash-selected-price').textContent = `$${button.dataset.ticketPrice}`;
    ticketDialog.showModal();
  });
}
document.querySelector('[data-preview-notes]').addEventListener('click', () => notesDialog.showModal());
