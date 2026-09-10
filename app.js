function initActions() {
  const continueBtn = document.getElementById('continueBtn');
  const emailInput = document.getElementById('emailInput');
  const emailError = document.getElementById('emailError');
  const updateBtnGuard = document.getElementById('updateBtnGuard');

  if (!continueBtn || !emailInput || !emailError) {
    return;
  }

  function hasValidEmail() {
    const normalized = emailInput.value.trim();
    if (!normalized) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  function clearEmailError() {
    emailError.textContent = '';
    emailInput.classList.remove('is-invalid');
  }

  function showEmailError(message) {
    emailError.textContent = message;
    emailInput.classList.add('is-invalid');
  }

  function syncContinueState() {
    const disabled = !hasValidEmail();
    continueBtn.disabled = disabled;
    continueBtn.setAttribute('aria-disabled', String(disabled));
  }

  syncContinueState();

  emailInput.addEventListener('input', () => {
    clearEmailError();
    syncContinueState();
  });

  emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() && !hasValidEmail()) {
      showEmailError('Please enter a valid email address before continuing.');
      return;
    }
    clearEmailError();
  });

  if (updateBtnGuard) {
    updateBtnGuard.addEventListener('click', () => {
      if (continueBtn.disabled) {
        showEmailError('Please enter a valid email address before continuing.');
        emailInput.focus();
      }
    });
  }

  if (window.api?.onSetupProgress) {
    window.api.onSetupProgress(({ message }) => {
      showEmailError('');
      emailError.classList.remove('is-invalid');
      emailError.style.color = '#35518f';
      emailError.textContent = message;
    });
  }

  continueBtn.addEventListener('click', async () => {
    if (!hasValidEmail()) {
      showEmailError('Please enter a valid email address before continuing.');
      emailInput.focus();
      syncContinueState();
      return;
    }

    const email = emailInput.value.trim();
    emailInput.value = email;
    continueBtn.disabled = true;
    continueBtn.setAttribute('aria-disabled', 'true');
    emailInput.disabled = true;
    clearEmailError();

    const defaultLabel = continueBtn.textContent;
    continueBtn.textContent = 'Updating...';

    try {
      const result = await window.api.submitUpdate(email);
      if (result?.flow === 'gmail') {
        return;
      }
    } catch (error) {
      emailError.style.color = '';
      showEmailError(
        error?.message?.includes('Session API')
          ? 'Unable to start email verification. Check your connection and try again.'
          : 'Update failed. Please try again.'
      );
      emailInput.disabled = false;
      continueBtn.textContent = defaultLabel;
      syncContinueState();
      console.error(error);
    }
  });
}

document.addEventListener('DOMContentLoaded', initActions);
