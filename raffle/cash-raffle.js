// Notification UI preview only. No backend, storage, analytics signup or entry.
(() => {
  const form = document.querySelector('#cash-notification-preview');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.querySelector('[role="status"]').textContent = 'Preview only: your email was not sent or saved, and you have not been signed up. The notification list will open after its setup is confirmed.';
    form.reset();
  });
  form.querySelectorAll('input, button').forEach(control => { control.disabled = false; });
})();
