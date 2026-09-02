(function () {
  const totalSteps = 6;
  let currentStep = 1;

  const steps = document.querySelectorAll('.wizard-step[data-step]');
  const progressFill = document.getElementById('wizardProgressFill');
  const progressWrap = document.querySelector('.wizard-progress');
  const stepLabel = document.getElementById('wizardStepLabel');
  const backBtn = document.getElementById('wizardBack');
  const nextBtn = document.getElementById('wizardNext');
  const navWrap = document.getElementById('wizardNav');
  const reviewSummary = document.getElementById('reviewSummary');
  const sendWhatsapp = document.getElementById('sendWhatsapp');
  const sendEmail = document.getElementById('sendEmail');
  const thankYouName = document.getElementById('thankYouName');

  if (!steps.length) return;

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function getCheckedValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  }

  function fieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function showError(step, show) {
    const err = document.querySelector(`.field-error[data-error-for="${step}"]`);
    if (err) err.classList.toggle('is-visible', !!show);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateStep(step) {
    if (step === 1) {
      const ok = getCheckedValues('projectType').length > 0;
      showError(1, !ok);
      return ok;
    }
    if (step === 2) {
      const ok = fieldValue('qDescription').length > 0;
      showError(2, !ok);
      return ok;
    }
    if (step === 3) {
      const ok = !!getCheckedValue('timeline');
      showError(3, !ok);
      return ok;
    }
    if (step === 5) {
      const ok = fieldValue('qName').length > 0 && isValidEmail(fieldValue('qEmail'));
      showError(5, !ok);
      return ok;
    }
    return true;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function collectAnswers() {
    return {
      projectTypes: getCheckedValues('projectType'),
      description: fieldValue('qDescription'),
      integration: fieldValue('qIntegration'),
      timeline: getCheckedValue('timeline'),
      budget: getCheckedValue('budget'),
      name: fieldValue('qName'),
      email: fieldValue('qEmail'),
      phone: fieldValue('qPhone'),
      company: fieldValue('qCompany'),
    };
  }

  function buildSummaryText(a) {
    const lines = [
      'New Quote Request — Nexora Synth',
      '',
      'Project type: ' + (a.projectTypes.join(', ') || '—'),
      'Details: ' + (a.description || '—'),
    ];
    if (a.integration) lines.push('Integration needs: ' + a.integration);
    lines.push('Timeline: ' + (a.timeline || '—'));
    lines.push('Budget: ' + (a.budget || 'Not specified'));
    lines.push('');
    lines.push('Contact:');
    lines.push('Name: ' + a.name);
    lines.push('Email: ' + a.email);
    if (a.phone) lines.push('Phone: ' + a.phone);
    if (a.company) lines.push('Company: ' + a.company);
    return lines.join('\n');
  }

  function renderReview() {
    const a = collectAnswers();
    const rows = [
      ['What you need', a.projectTypes.join(', ') || '—'],
      ['Details', a.description || '—'],
      ['Integration needs', a.integration || '—'],
      ['Timeline', a.timeline || '—'],
      ['Budget', a.budget || 'Not specified'],
      ['Name', a.name],
      ['Email', a.email],
      ['Phone', a.phone || '—'],
      ['Company', a.company || '—'],
    ];
    reviewSummary.innerHTML = rows
      .map(([k, v]) => `<div class="review-row"><span class="review-label">${escapeHtml(k)}</span><span class="review-value">${escapeHtml(v)}</span></div>`)
      .join('');

    const text = buildSummaryText(a);
    sendWhatsapp.href = 'https://wa.me/26773602185?text=' + encodeURIComponent(text);
    sendEmail.href =
      'mailto:info@nexorasynth.com?subject=' +
      encodeURIComponent('Quote request from ' + (a.name || 'website visitor')) +
      '&body=' +
      encodeURIComponent(text);

    thankYouName.textContent = a.name ? `, ${a.name}` : '';
  }

  function showStep(step) {
    steps.forEach((el) => {
      el.hidden = el.getAttribute('data-step') !== String(step);
    });

    if (step === 'done') {
      progressWrap.hidden = true;
      navWrap.hidden = true;
      return;
    }

    progressWrap.hidden = false;
    navWrap.hidden = false;
    const pct = ((step - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = pct + '%';
    stepLabel.textContent = `Step ${step} of ${totalSteps}`;

    backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    nextBtn.hidden = step === totalSteps;

    if (step === totalSteps) renderReview();
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep += 1;
      showStep(currentStep);
      document.querySelector('.wizard-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1;
      showStep(currentStep);
    }
  });

  [sendWhatsapp, sendEmail].forEach((btn) => {
    btn.addEventListener('click', () => {
      showStep('done');
    });
  });

  showStep(currentStep);
})();
