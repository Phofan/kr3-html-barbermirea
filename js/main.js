/* ==========================================================================
   Основной скрипт проекта barbermirea (КР №3 — Bootstrap 5)
   1. Автоподстановка услуги и мастера в модальное окно онлайн-записи
   2. Клиентская валидация форм Bootstrap и показ уведомления alert-success
   3. Живая фильтрация услуг и мужской косметики на странице catalog.html
   4. Кнопка быстрого возврата «Наверх»
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBookingModal();
  initValidationForms();
  initCatalogFilters();
  initBackToTop();
  setMinDateInputs();
});

/**
 * Устанавливает сегодняшнюю дату как минимальную для полей выбора даты
 */
function setMinDateInputs() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.min) {
      input.min = today;
    }
    if (!input.value) {
      input.value = today;
    }
  });
}

/**
 * Подставляет выбранную услугу или мастера при открытии модального окна Bootstrap
 */
function initBookingModal() {
  const bookingModal = document.getElementById('bookingModal');
  if (!bookingModal) return;

  bookingModal.addEventListener('show.bs.modal', (event) => {
    const triggerButton = event.relatedTarget;
    const serviceSelect = document.getElementById('modalService');
    const masterSelect = document.getElementById('modalMaster');
    const successAlert = document.getElementById('modalSuccessAlert');
    const form = document.getElementById('bookingModalForm');

    if (successAlert) {
      successAlert.classList.add('d-none');
    }
    if (form) {
      form.classList.remove('was-validated');
    }

    if (!triggerButton) return;

    const selectedService = triggerButton.getAttribute('data-service');
    const selectedMaster = triggerButton.getAttribute('data-master');

    if (selectedService && serviceSelect) {
      selectOrCreateOption(serviceSelect, selectedService);
    }

    if (selectedMaster && masterSelect) {
      selectOrCreateOption(masterSelect, selectedMaster);
    }
  });
}

/**
 * Выбирает существующий пункт в <select> или добавляет его, если такого ещё нет
 */
function selectOrCreateOption(selectElement, valueText) {
  const existingOption = Array.from(selectElement.options).find(
    (opt) => opt.value === valueText || opt.textContent.trim() === valueText
  );

  if (existingOption) {
    selectElement.value = existingOption.value;
  } else {
    const newOption = document.createElement('option');
    newOption.value = valueText;
    newOption.textContent = valueText;
    selectElement.appendChild(newOption);
    selectElement.value = valueText;
  }
}

/**
 * Обрабатывает отправку форм с проверкой Bootstrap (.needs-validation)
 */
function initValidationForms() {
  const forms = document.querySelectorAll('.needs-validation');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      form.classList.remove('was-validated');

      const alertId = form.getAttribute('data-alert-target');
      const alertBox = alertId ? document.getElementById(alertId) : null;

      const clientName = form.querySelector('[name="clientName"]')?.value.trim() || 'Гость';
      const service = form.querySelector('[name="service"]')?.value || 'Консультация';
      const master = form.querySelector('[name="master"]')?.value || 'Любой свободный мастер';
      const visitDate = form.querySelector('[name="visitDate"]')?.value || '';

      if (alertBox) {
        const dateNote = visitDate ? ` на дату ${visitDate}` : '';
        alertBox.innerHTML = `
          <strong>Заявка успешно отправлена!</strong><br>
          ${escapeHtml(clientName)}, вы записаны на «${escapeHtml(service)}» (${escapeHtml(master)})${escapeHtml(dateNote)}.
          Администратор свяжется с вами для подтверждения времени.
        `;
        alertBox.classList.remove('d-none');
      }

      form.reset();
      setMinDateInputs();
    });
  });
}

/**
 * Экранирует пользовательский ввод перед выводом в уведомление
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Фильтрация карточек услуг и мужской косметики на странице catalog.html
 */
function initCatalogFilters() {
  const catalogGrid = document.getElementById('catalogGrid');
  if (!catalogGrid) return;

  const items = Array.from(catalogGrid.querySelectorAll('.catalog-item'));
  const searchInput = document.getElementById('catalogSearch');
  const categorySelect = document.getElementById('catalogCategory');
  const priceSelect = document.getElementById('catalogPrice');
  const promoCheck = document.getElementById('catalogPromoOnly');
  const resetBtn = document.getElementById('catalogResetBtn');
  const countLabel = document.getElementById('catalogCount');
  const emptyAlert = document.getElementById('catalogEmptyAlert');

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const category = categorySelect?.value || 'all';
    const maxPrice = priceSelect?.value && priceSelect.value !== 'all'
      ? Number(priceSelect.value)
      : Infinity;
    const promoOnly = Boolean(promoCheck?.checked);

    let visibleCount = 0;

    items.forEach((item) => {
      const itemCategory = item.getAttribute('data-category') || '';
      const itemPrice = Number(item.getAttribute('data-price') || 0);
      const itemPromo = item.getAttribute('data-promo') === 'true';
      const itemText = item.textContent.toLowerCase();

      const matchesQuery = !query || itemText.includes(query);
      const matchesCategory = category === 'all' || itemCategory === category;
      const matchesPrice = itemPrice <= maxPrice;
      const matchesPromo = !promoOnly || itemPromo;

      const isVisible = matchesQuery && matchesCategory && matchesPrice && matchesPromo;
      item.classList.toggle('d-none', !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (countLabel) {
      countLabel.textContent = `Показано позиций: ${visibleCount} из ${items.length}`;
    }

    if (emptyAlert) {
      emptyAlert.classList.toggle('d-none', visibleCount > 0);
    }
  }

  searchInput?.addEventListener('input', applyFilters);
  categorySelect?.addEventListener('change', applyFilters);
  priceSelect?.addEventListener('change', applyFilters);
  promoCheck?.addEventListener('change', applyFilters);

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (priceSelect) priceSelect.value = 'all';
    if (promoCheck) promoCheck.checked = false;
    applyFilters();
  });

  applyFilters();
}

/**
 * Показ и плавный скролл кнопки «Наверх»
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 300);
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
