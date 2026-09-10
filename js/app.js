document.addEventListener('DOMContentLoaded', () => {
    // Menu responsivo mobile
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Contagem regressiva para 18 de Março de 2028 às 16:00:00
    const weddingDate = new Date('2028-03-18T16:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "<h3>O Grande Dia chegou!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Botão de Compartilhar no WhatsApp
    const whatsappBtn = document.getElementById('whatsappShareBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const siteUrl = window.location.href;
            const message = encodeURIComponent(`💍 Gustavo e Mariana vão se casar! Venha fazer parte desse momento especial. Acesse nossa página de casamento: ${siteUrl}`);
            window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
        });
    }

    // Gerador de QR Code
    const qrcodeContainer = document.getElementById('qrcode');
    if (qrcodeContainer) {
        const currentUrl = encodeURIComponent(window.location.href);
        qrcodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${currentUrl}" alt="QR Code do Site" style="border-radius:4px;">`;
    }
});
