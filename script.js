// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== MENÚ MÓVIL ==========
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('visible');
        this.setAttribute('aria-expanded', navMenu.classList.contains('visible'));
    });

    // ========== SUBMENÚS ==========
    document.querySelectorAll('.menu-con-submenu').forEach(menu => {
        const trigger = menu.querySelector('.submenu-trigger');
        const submenu = menu.querySelector('.submenu');
        
        // Evento click para dispositivos táctiles
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = submenu.classList.toggle('show');
            this.setAttribute('aria-expanded', isOpen);
        });

        // Evento hover para desktop
        menu.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                submenu.classList.add('show');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        menu.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                submenu.classList.remove('show');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ========== LECTURA DE CONTENIDO ==========
    const synth = window.speechSynthesis;
    let utterance = null;
    const speechControls = {
        play: document.querySelector('[aria-label="Activar lectura automática"]'),
        pause: document.querySelector('[aria-label="Pausar lectura"]'),
        stop: document.querySelector('[aria-label="Detener lectura"]')
    };

    // Funciones de control
    window.leerContenido = function() {
        if (synth.speaking) synth.cancel();
        
        const mainContent = document.getElementById('content');
        const contenido = Array.from(mainContent.querySelectorAll('h1, h2, h3, p, li, [aria-label]'))
            .map(element => element.textContent.trim())
            .filter(text => text.length > 0)
            .join('. ');
        
        utterance = new SpeechSynthesisUtterance(contenido);
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;
        
        // Eventos
        utterance.onstart = () => {
            speechControls.play.disabled = true;
            speechControls.pause.disabled = false;
            speechControls.stop.disabled = false;
        };
        
        utterance.onend = utterance.onerror = () => {
            speechControls.play.disabled = false;
            speechControls.pause.disabled = true;
            speechControls.stop.disabled = true;
        };

        synth.speak(utterance);
    };

    window.pausarLectura = function() {
        if (synth.speaking) {
            synth.pause();
            speechControls.pause.disabled = true;
        }
    };

    window.reanudarLectura = function() {
        if (synth.paused) {
            synth.resume();
            speechControls.pause.disabled = false;
        }
    };

    window.detenerLectura = function() {
        synth.cancel();
        speechControls.play.disabled = false;
    };

    // ========== ACCESIBILIDAD ==========
    // Enfoque en el contenido al usar el skip link
    document.querySelector('.skip-link').addEventListener('click', function(e) {
        const target = document.getElementById('content');
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    });

    // Verificar compatibilidad con speechSynthesis
    if (!('speechSynthesis' in window)) {
        const alerta = document.createElement('div');
        alerta.role = 'alert';
        alerta.textContent = 'La función de lectura automática no está disponible en su navegador.';
        alerta.className = 'accesibilidad-alerta';
        document.body.prepend(alerta);
    }

    // ========== CIERRE AUTOMÁTICO MENÚS AL REDIMENSIONAR ==========
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('visible');
            document.querySelectorAll('.submenu').forEach(sub => {
                sub.classList.remove('show');
                sub.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
        }
    });
});

// ========== POLYFILL PARA IE11 ==========
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
// Función para cambiar idioma
function cambiarIdioma(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLang', lang);
    
    // Oculta/muestra elementos según el idioma
    document.querySelectorAll('[data-lang]').forEach(el => {
        if(el.dataset.lang === lang) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
    
    // Actualiza el texto del botón
    const langButton = document.querySelector('.language-selector .submenu-trigger');
    langButton.innerHTML = `<i class="fas fa-globe"></i> ${lang.toUpperCase()}`;
}

// Event listeners para los botones de idioma
document.querySelectorAll('.lang-option').forEach(button => {
    button.addEventListener('click', function() {
        const lang = this.dataset.lang;
        cambiarIdioma(lang);
    });
});

// Cargar idioma guardado
const savedLang = localStorage.getItem('preferredLang') || 'es';
cambiarIdioma(savedLang);