const contactSection = document.querySelector('.contact');
const contactForm = document.querySelector('[data-contact-form]');

if (contactSection) {
  const contactObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) contactSection.classList.add('is-visible');
  }, { threshold: 0.16 });
  contactObserver.observe(contactSection);
}

if (contactForm) {
  const status = contactForm.querySelector('[data-contact-status]');
  const submitButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(contactForm);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const subject = String(form.get('subject') || '').trim();
    const message = String(form.get('message') || '').trim();

    status.classList.remove('is-success', 'is-error');
    status.textContent = 'Sending message…';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    try {
      const response = await fetch('https://formsubmit.co/ajax/idhaanarwadkar@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          _subject: `Portfolio message: ${subject}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error(result.message || 'Message could not be sent.');
      }

      contactForm.reset();
      status.classList.add('is-success');
      status.textContent = 'Message sent — thank you.';
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = 'Could not send. Please use the mail app link.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send message ↗';
    }
  });
}
