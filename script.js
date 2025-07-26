// Inicijalizacija i18next
i18next.init({
    lng: localStorage.getItem('lang') || 'bs',
    fallbackLng: 'bs',
    resources: {
        bs: { translation: {} },
        de: { translation: {} }
    }
}, function(err, t) {
    if (err) {
        console.error('Greška pri inicijalizaciji i18next:', err);
        return;
    }
    Promise.all([
        fetch('translations/bs.json').then(res => {
            if (!res.ok) throw new Error('Ne mogu učitati bs.json');
            return res.json();
        }).then(data => i18next.addResourceBundle('bs', 'translation', data)),
        fetch('translations/de.json').then(res => {
            if (!res.ok) throw new Error('Ne mogu učitati de.json');
            return res.json();
        }).then(data => i18next.addResourceBundle('de', 'translation', data))
    ]).then(() => {
        updateContent();
        initializePrivacyPopup();
        initializeCookiePopup();
    }).catch(err => {
        console.error('Greška pri učitavanju JSON fajlova:', err);
    });
});

// Funkcija za ažuriranje sadržaja
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = i18next.t(key) || key;
    });

    document.querySelectorAll('[data-i18n="[html]email_text"]').forEach(el => {
        el.innerHTML = i18next.t('email_text');
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt');
        el.alt = i18next.t(key) || el.alt || key;
    });

    const metaDescriptions = {
        bs: "Kontaktirajte Prevodilački ured Beširević za brze i pouzdane prijevode na njemački i bosanski jezik!",
        de: "Kontaktieren Sie das Übersetzungsbüro Beširević für schnelle und zuverlässige Übersetzungen auf Deutsch und Bosnisch!"
    };
    const currentLang = i18next.language || 'bs';
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
        metaTag.setAttribute('content', metaDescriptions[currentLang]);
    }

    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    if (emailInput) emailInput.placeholder = i18next.t('emailPlaceholder');
    if (nameInput) nameInput.placeholder = i18next.t('namePlaceholder');
    if (messageInput) messageInput.placeholder = i18next.t('messagePlaceholder');
    if (submitButton) submitButton.textContent = i18next.t('submitButton');
}

// Funkcija za inicijalizaciju pop-upa politike privatnosti
function initializePrivacyPopup() {
    const privacyPopup = document.getElementById('privacy-popup');
    const acceptButton = document.getElementById('accept-privacy');
    const showPrivacyButtons = document.querySelectorAll('#show-privacy, #show-privacy-popup');
    const closeButton = document.querySelector('#privacy-popup .close-popup');
    const learnMorePrivacyLink = document.getElementById('learn-more-privacy');
    const currentPrivacyVersion = '1.0';

    if (!privacyPopup || !acceptButton || !closeButton) {
        console.error("Elementi 'privacy-popup', 'accept-privacy' ili 'close-popup' nisu pronađeni.");
        return;
    }

    if (localStorage.getItem('privacyVersion') !== currentPrivacyVersion) {
        privacyPopup.style.display = 'flex';
        console.log('Prikazujem privacy-popup jer verzija nije prihvaćena.');
    }

    function openPrivacyPopup() {
        privacyPopup.style.display = 'flex';
        document.querySelector('#privacy-popup .popup-content').scrollTop = 0;
        console.log('Otvoren privacy-popup.');
    }

    function closePrivacyPopup() {
        privacyPopup.style.display = 'none';
        console.log('Zatvoren privacy-popup.');
    }

    acceptButton.addEventListener('click', () => {
        closePrivacyPopup();
        localStorage.setItem('privacyVersion', currentPrivacyVersion);
        console.log('Prihvaćena privacy verzija:', currentPrivacyVersion);
    });

    closeButton.addEventListener('click', closePrivacyPopup);

    showPrivacyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openPrivacyPopup();
        });
    });

    if (learnMorePrivacyLink) {
        learnMorePrivacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPrivacyPopup();
        });
    } //else {//
        //console.error("Element '#learn-more-privacy' nije pronađen.");//
    

    privacyPopup.addEventListener('click', (e) => {
        if (e.target === privacyPopup) {
            closePrivacyPopup();
        }
    });

    const privacyLink = document.getElementById('show-privacy-link');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPrivacyPopup();
        });
    }
}

// Funkcija za inicijalizaciju pop-upa za kolačiće
function initializeCookiePopup() {
    const cookiePopup = document.getElementById('cookie-popup');
    const acceptCookies = document.getElementById('accept-cookies');
    const rejectCookies = document.getElementById('reject-cookies');
    const closeButton = document.querySelector('#cookie-popup .close-popup');

    if (!cookiePopup || !acceptCookies || !rejectCookies || !closeButton) {
        console.error("Elementi 'cookie-popup', 'accept-cookies', 'reject-cookies' ili 'close-popup' nisu pronađeni.");
        return;
    }

    const consent = localStorage.getItem('cookieConsent');
    console.log('cookieConsent status:', consent);
    if (consent !== 'true') {
        cookiePopup.style.display = 'flex';
        console.log('Prikazujem cookie-popup jer consent nije "true".');
    } else {
        console.log('Cookie-popup nije prikazan jer je consent "true".');
    }

    function closeCookiePopup() {
        cookiePopup.style.display = 'none';
        console.log('Zatvoren cookie-popup.');
    }

    acceptCookies.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        window['ga-disable-G-NTBTVVJ29Z'] = false;
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        closeCookiePopup();
        console.log('Prihvaćeni kolačići, cookieConsent postavljen na "true".');
    });

    rejectCookies.addEventListener('click', () => {
        localStorage.removeItem('cookieConsent');
        window['ga-disable-G-NTBTVVJ29Z'] = true;
        gtag('consent', 'update', { 'analytics_storage': 'denied' });
        closeCookiePopup();
        console.log('Odbijeni kolačići, cookieConsent uklonjen.');
    });

    closeButton.addEventListener('click', () => {
        localStorage.removeItem('cookieConsent');
        closeCookiePopup();
        console.log('Zatvoren cookie-popup, cookieConsent uklonjen.');
    });

    cookiePopup.addEventListener('click', (e) => {
        if (e.target === cookiePopup) {
            localStorage.removeItem('cookieConsent');
            closeCookiePopup();
            console.log('Zatvoren cookie-popup klikom izvan, cookieConsent uklonjen.');
        }
    });
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const email = 'prevodilackiuredbesirevic' + '@' + 'gmail.com';
    const emailLinks = document.querySelectorAll('#email-link, #footer-email-link');
    emailLinks.forEach(link => {
        link.setAttribute('href', 'mailto:' + email);
        link.innerHTML = i18next.t('email_text') || email;
    });

    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    } else {
        console.error("Element s klasom 'logo' nije pronađen.");
    }

    document.querySelectorAll('.flag').forEach((img, index) => {
        img.addEventListener('click', () => {
            const lang = index === 0 ? 'bs' : 'de';
            i18next.changeLanguage(lang, () => {
                updateContent();
                localStorage.setItem('lang', lang);
            });
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const t = i18next.t;
            const userEmail = document.getElementById('email').value;
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const consent = document.getElementById('consent').checked;
            const messageDiv = document.getElementById('message');

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!name) {
                messageDiv.textContent = t('validationName');
                messageDiv.style.color = '#c9302c';
                return;
            }
            if (!emailPattern.test(userEmail)) {
                messageDiv.textContent = t('validationEmail');
                messageDiv.style.color = '#c9302c';
                return;
            }
            if (!message) {
                messageDiv.textContent = t('validationMessage');
                messageDiv.style.color = '#c9302c';
                return;
            }
            if (!consent) {
                messageDiv.textContent = t('validationConsent');
                messageDiv.style.color = '#c9302c';
                return;
            }

            const now = new Date();
            const timeSent = now.toLocaleString('bs-BA', {
                timeZone: 'Europe/Sarajevo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$1-$2-$3 u $4:$5:$6');

            const formData = new FormData(contactForm);
            formData.append('timeSent', timeSent);

            fetch('https://formspree.io/f/movldljb', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    messageDiv.textContent = `${t('successMessage')} ${timeSent}.`;
                    messageDiv.style.color = '#005bb5';
                    contactForm.reset();
                    setTimeout(() => {
                        messageDiv.style.opacity = '0';
                    }, 5000);
                } else {
                    messageDiv.textContent = t('form_error');
                    messageDiv.style.color = '#c9302c';
                }
            })
            .catch(error => {
                messageDiv.textContent = t('form_error');
                messageDiv.style.color = '#c9302c';
                console.error('Greška prilikom slanja forme:', error);
            });

            messageDiv.style.transition = 'opacity 0.5s';
            messageDiv.style.opacity = '1';
        });
    } else {
        console.error("Kontakt forma nije pronađena.");
    }
});
