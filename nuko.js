// nuko.js: Custom Stationary Nuko for Vencord
(function() {
    function injectNuko() {
        const chatForm = document.querySelector('form.form_f75fb0');
        // If the chat bar doesn't exist, or Nuko is already there, do nothing
        if (!chatForm || document.getElementById('nuko')) return;

        // 1. Create the Cat Element
        const nuko = document.createElement('div');
        nuko.id = 'nuko';
        nuko.className = 'sleeping'; // Default state
        chatForm.appendChild(nuko);

        // 2. Hover Logic
        nuko.addEventListener('mouseenter', () => {
            if (!nuko.classList.contains('typing') && !nuko.classList.contains('blushing')) {
                nuko.className = 'awake';
            }
        });
        
        nuko.addEventListener('mouseleave', () => {
            if (!nuko.classList.contains('typing') && !nuko.classList.contains('blushing')) {
                nuko.className = 'sleeping';
            }
        });

        // 3. Click Logic (Single Click, no holding required)
        nuko.addEventListener('click', () => {
            nuko.className = 'blushing';
            
            // Wait 0.7s for the blushex animation to finish, then return to awake/sleep
            setTimeout(() => {
                if (nuko.matches(':hover')) {
                    nuko.className = 'awake';
                } else {
                    nuko.className = 'sleeping';
                }
            }, 700); // 700ms matches the CSS blushex duration
        });

        // 4. Typing Logic
        const editor = chatForm.querySelector('[class*="editor_"]');
        if (editor) {
            editor.addEventListener('focus', () => {
                nuko.className = 'typing';
            });
            editor.addEventListener('blur', () => {
                if (nuko.matches(':hover')) {
                    nuko.className = 'awake';
                } else {
                    nuko.className = 'sleeping';
                }
            });
        }
    }

    // Discord is a Single Page Application, so we observe the DOM for the chat bar to appear
    const observer = new MutationObserver(() => {
        if (document.querySelector('form.form_f75fb0') && !document.getElementById('nuko')) {
            injectNuko();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Try to inject immediately in case the chat is already loaded
    injectNuko();
})();
