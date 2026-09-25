/* Presentation shared by the home, catalogue and generated model pages. */
(() => {
  const isModel = Boolean(window.productModel);
  const prefix = isModel ? '../../../' : '';
  document.body.classList.add('ui-v6');

  function icon(name) {
    return '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  }

  function iconButton(selector, name, label) {
    document.querySelectorAll(selector).forEach(button => {
      button.innerHTML = icon(name);
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  function paintIcons() {
    window.lucide?.createIcons();
  }

  function decorateTheme() {
    const night = document.body.classList.contains('night-theme');
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    iconButton('.theme-toggle', night ? 'sun' : 'moon', night ? 'Switch to Day Mode' : 'Switch to Night Mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle?.setAttribute('aria-pressed', String(night));
    document.querySelectorAll('.mobile-filter-toggle').forEach(button => {
      button.innerHTML = icon('sliders-horizontal') + '<span>Filters</span>';
    });
    paintIcons();
  }

  function decorateHeader() {
    const brand = document.querySelector('.brand-name, .brand-link');
    if (brand && !brand.closest('.site-header') && !brand.querySelector('.brand-signature')) {
      brand.insertAdjacentHTML('beforeend', '<span class="brand-signature">SAFE LOCKERS &amp; STRONG ROOM DOORS</span>');
    }
    const header = document.querySelector('.site-header, .page-header');
    if (!header || header.dataset.glassHeader) return;
    header.dataset.glassHeader = 'true';
    const back = header.querySelector('.back-link');
    if (back) { back.innerHTML = icon('arrow-left') + '<span>Products</span>'; back.setAttribute('aria-label', 'Back to products'); }
    if (document.querySelector('.site-header')) {
      header.insertAdjacentHTML('beforeend', '<p class="header-caption">Security for what matters.</p>');
    } else if (!isModel) {
      header.insertAdjacentHTML('beforeend', '<nav class="header-links" aria-label="Main navigation"><a href="index.html">Home</a><a class="header-enquiry" href="index.html#enquiry-section">Enquire</a></nav>');
    }
  }

  function decorateModel() {
    decorateHeader();
    const main = document.querySelector('.model-page');
    if (main && !main.querySelector('.model-breadcrumb')) {
      const crumb = document.createElement('p');
      crumb.className = 'model-breadcrumb';
      const link = document.createElement('a');
      link.href = prefix + 'product.html';
      link.textContent = 'Our collection';
      crumb.append(link, document.createTextNode(' / ' + window.productModel.category));
      main.prepend(crumb);
    }
    iconButton('.gallery-button.previous', 'chevron-left', 'Previous product image');
    iconButton('.gallery-button.next', 'chevron-right', 'Next product image');
    iconButton('.zoom-button', 'expand', 'Enlarge product image');
    iconButton('.zoom-close', 'x', 'Close enlarged image');
    iconButton('.suggestion-left', 'arrow-left', 'Previous suggestions');
    iconButton('.suggestion-right', 'arrow-right', 'Next suggestions');
    document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
      dot.setAttribute('aria-label', 'Show image ' + (index + 1));
      dot.setAttribute('aria-pressed', String(dot.classList.contains('active')));
    });
    document.querySelector('.call-button')?.insertAdjacentHTML('afterbegin', icon('phone'));
    document.querySelector('.whatsapp-button')?.insertAdjacentHTML('afterbegin', icon('message-circle'));
    const zoom = document.querySelector('.zoom-overlay');
    if (zoom) {
      zoom.setAttribute('role', 'dialog');
      zoom.setAttribute('aria-modal', 'true');
      zoom.setAttribute('aria-label', 'Enlarged product image');
    }
    decorateTheme();
  }

  function decorateCards() {
    const grid = document.querySelector('#productGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.product-card');
    const count = document.getElementById('catalogueCount');
    if (count) count.textContent = cards.length + (cards.length === 1 ? ' model' : ' models');
    cards.forEach(card => {
      const image = card.querySelector('img');
      if (image) image.loading = 'lazy';
      const model = card.querySelector('.product-model')?.textContent;
      const product = window.eagleSafeProducts.find(item => item.model === model);
      const info = card.querySelector('.product-info');
      if (product && info && !info.querySelector('.product-meta-type')) {
        const label = document.createElement('p');
        label.className = 'product-meta-type';
        label.textContent = product.categoryName.toUpperCase();
        info.prepend(label);
        const summary = info.querySelector('.product-category');
        summary.textContent = (product.outerHeightInches / 12).toFixed(1) + ' ft H / ' + (product.outerWidthInches / 12).toFixed(1) + ' ft W';
      }
    });
  }

  // Home page: retain the complete collection and business flows, with a new visual hierarchy.
  const intro = document.querySelector('.intro-section');
  if (intro) {
    // The homepage HTML keeps the original introduction and actions below the slideshow.
    document.querySelector('.product-types .section-title').textContent = 'Find your kind of security.';
    document.querySelector('.product-types .section-subtitle').textContent = 'Explore 55 models across seven collections.';
    document.querySelectorAll('.product-band-kicker').forEach((label, index) => {
      label.textContent = 'COLLECTION ' + String(index + 1).padStart(2, '0');
    });
    document.querySelectorAll('.view-category-link').forEach(link => link.insertAdjacentHTML('beforeend', icon('arrow-up-right')));
    document.querySelectorAll('.product-card-label').forEach(label => label.insertAdjacentHTML('beforeend', icon('arrow-up-right')));
    document.querySelectorAll('.product-types img').forEach(img => { img.loading = 'lazy'; });
    ['shield-check', 'key-round', 'ruler', 'map-pin'].forEach((name, index) => {
      document.querySelectorAll('.trust-card')[index]?.insertAdjacentHTML('afterbegin', '<div class="trust-icon">' + icon(name) + '</div>');
    });
    const enquiry = document.querySelector('.enquiry-section');
    enquiry.id = 'enquiry-section';
    const title = enquiry.querySelector('.enquiry-title');
    const heading = document.createElement('div');
    title.textContent = 'Let\'s find your perfect safe.';
    title.before(heading);
    heading.append(title);
    heading.insertAdjacentHTML('beforeend', '<p class="enquiry-note">Tell us where you are and how to reach you. Our team can help with product enquiries and custom requirements.</p>');
    document.querySelector('.visit-section').id = 'visit-section';
    document.querySelector('.intro-section').id = 'intro-section';
    document.querySelector('.submit-button').innerHTML = 'Send enquiry ' + icon('arrow-right');
    document.querySelector('.intro-action').insertAdjacentHTML('beforeend', icon('arrow-right'));
    iconButton('.slider-button.previous', 'chevron-left', 'Previous advertisement');
    iconButton('.slider-button.next', 'chevron-right', 'Next advertisement');
    iconButton('.product-left', 'arrow-left', 'Previous models');
    iconButton('.product-right', 'arrow-right', 'Next models');
    iconButton('.quick-nav-menu', 'ellipsis', 'Open navigation menu');
    const menu = document.querySelector('.quick-nav-dropdown');
    const trigger = document.querySelector('.quick-nav-menu');
    menu.id = 'mobileNavigation';
    trigger.setAttribute('aria-controls', menu.id);
    const syncMenu = () => trigger.setAttribute('aria-expanded', String(!menu.hidden));
    new MutationObserver(syncMenu).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    syncMenu();
    document.addEventListener('click', event => {
      if (!event.target.closest('.quick-nav-inner')) menu.hidden = true;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { menu.hidden = true; trigger.focus(); }
    });
  }

  if (document.querySelector('.product-page')) {
    document.querySelector('.page-title').textContent = 'Our collection';
    document.querySelector('.page-intro').textContent = 'A safe for every space. Explore our lockers and strong room doors, and find the right fit.';
    document.querySelector('.product-layout').insertAdjacentHTML('beforebegin', '<div class="catalogue-toolbar"><strong id="catalogueCount" role="status" aria-live="polite"></strong><span>EAGLE SAFE / All models</span></div>');
    decorateCards();
    new MutationObserver(decorateCards).observe(document.getElementById('productGrid'), { childList: true });
    iconButton('.filter-close', 'x', 'Close filters');
    // Numeric ticks follow the input's range, rather than evenly spacing variable-width labels.
    const ranges = [
      ['heightFilter', [0, 2, 4, 6, 8, 10], 'ft'],
      ['widthFilter', [0, 2, 4, 6, 8, 10], 'ft'],
      ['volumeFilter', [0, 500, 1000, 1500, 2000], 'litres'],
      ['weightFilter', [0, 500, 1000, 1500, 2000, 2500], 'kilograms'],
    ];
    const updateRange = (input, unit) => {
      const fraction = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
      input.style.setProperty('--range-fill', (fraction * 100) + '%');
      const text = unit === 'ft' ? 'Under ' + input.value + ' feet' : input.value + ' ' + unit + ' or more';
      input.setAttribute('aria-valuetext', text);
    };
    ranges.forEach(([id, ticks, unit]) => {
      const input = document.getElementById(id);
      const scale = input.closest('.range-field').querySelector('.range-scale');
      scale.replaceChildren(...ticks.map(value => {
        const label = document.createElement('span');
        label.textContent = String(value);
        label.dataset.value = value;
        label.style.left = ((value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100) + '%';
        return label;
      }));
      scale.setAttribute('aria-hidden', 'true');
      input.addEventListener('input', () => updateRange(input, unit));
      updateRange(input, unit);
    });
    document.getElementById('clearFilters').addEventListener('click', () => {
      ranges.forEach(([id, , unit]) => updateRange(document.getElementById(id), unit));
    });
    const panel = document.querySelector('.filter-panel');
    const toggle = document.querySelector('.mobile-filter-toggle');
    panel.id = 'filterPanel';
    toggle.setAttribute('aria-controls', panel.id);
    // Move keyboard focus into the mobile drawer; restore it when the drawer closes.
    let wasOpen = false;
    const syncFilter = () => {
      const open = document.body.classList.contains('filter-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (matchMedia('(max-width: 860px)').matches) {
        panel.inert = !open;
        if (open && !wasOpen) panel.querySelector('.filter-close').focus();
        if (!open && wasOpen) toggle.focus();
      } else panel.inert = false;
      wasOpen = open;
    };
    new MutationObserver(syncFilter).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', syncFilter);
    syncFilter();
    document.addEventListener('click', event => {
      if (wasOpen && !event.composedPath().includes(panel) && !event.composedPath().includes(toggle)) panel.querySelector('.filter-close').click();
    });
    document.addEventListener('keydown', event => {
      if (!wasOpen || event.key !== 'Tab') return;
      const controls = [...panel.querySelectorAll('button,input,a')].filter(el => !el.disabled);
      if (event.shiftKey && document.activeElement === controls[0]) { controls.at(-1).focus(); event.preventDefault(); }
      if (!event.shiftKey && document.activeElement === controls.at(-1)) { controls[0].focus(); event.preventDefault(); }
    });
  }

  if (isModel) {
    decorateModel();
    new MutationObserver(decorateModel).observe(document.getElementById('root'), { childList: true });
    document.addEventListener('click', event => {
      const overlay = document.querySelector('.zoom-overlay');
      if (event.target.closest('.zoom-button')) overlay.querySelector('.zoom-close').focus();
      if (event.target === overlay) overlay.querySelector('.zoom-close').click();
      if (event.target.closest('.zoom-close')) document.querySelector('.zoom-button').focus();
    });
    document.addEventListener('keydown', event => {
      const overlay = document.querySelector('.zoom-overlay');
      if (overlay.hidden) return;
      if (event.key === 'Escape') overlay.querySelector('.zoom-close').click();
      if (event.key === 'Tab') { event.preventDefault(); overlay.querySelector('.zoom-close').focus(); }
    });
  } else decorateHeader();

  new MutationObserver(decorateTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  decorateTheme();
})();
