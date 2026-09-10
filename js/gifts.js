let allGifts = [];
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadGifts();

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-category');
            renderGifts(cat);
        });
    });

    const giftModal = document.getElementById('giftModal');
    const closeGiftModal = document.getElementById('closeGiftModal');
    if (closeGiftModal) closeGiftModal.addEventListener('click', () => giftModal.classList.remove('active'));

    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const openCartModalBtn = document.getElementById('openCartModalBtn');
    if (closeCartModal) closeCartModal.addEventListener('click', () => cartModal.classList.remove('active'));
    if (openCartModalBtn) openCartModalBtn.addEventListener('click', () => {
        renderCartModal();
        cartModal.classList.add('active');
    });

    const giftForm = document.getElementById('giftForm');
    if (giftForm) {
        giftForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const giftId = document.getElementById('modalGiftId').value;
            const guestName = document.getElementById('guestName').value;
            const message = document.getElementById('guestMessage').value;

            try {
                if (typeof db !== 'undefined') {
                    await db.collection('gifts').doc(giftId).update({
                        status: 'reservado',
                        reservedBy: guestName
                    });

                    await db.collection('reservations_log').add({
                        giftId: giftId,
                        giftName: document.getElementById('modalGiftName').innerText,
                        guestName: guestName,
                        message: message,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    const gift = allGifts.find(g => g.id === giftId);
                    if (gift) gift.status = 'reservado';
                }

                alert('Presente escolhido com sucesso! Muito obrigado pelo carinho.');
                giftModal.classList.remove('active');
                giftForm.reset();
                loadGifts();
            } catch (error) {
                console.error("Erro ao reservar presente:", error);
                alert("Ocorreu um erro ao registrar a escolha.");
            }
        });
    }

    const cartCheckoutForm = document.getElementById('cartCheckoutForm');
    if (cartCheckoutForm) {
        cartCheckoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const guestName = document.getElementById('cartGuestName').value;

            if (cart.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }

            try {
                if (typeof db !== 'undefined') {
                    const batch = db.batch();
                    cart.forEach(item => {
                        const giftRef = db.collection('gifts').doc(item.id);
                        batch.update(giftRef, { status: 'reservado', reservedBy: guestName });
                    });
                    await batch.commit();

                    await db.collection('reservations_log').add({
                        guestName: guestName,
                        items: cart,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    cart.forEach(item => {
                        const g = allGifts.find(x => x.id === item.id);
                        if (g) g.status = 'reservado';
                    });
                }

                alert('Presentes reservados com sucesso através do carrinho!');
                cart = [];
                updateCartBar();
                cartModal.classList.remove('active');
                cartCheckoutForm.reset();
                loadGifts();
            } catch (error) {
                console.error("Erro no checkout:", error);
                alert("Erro ao finalizar carrinho.");
            }
        });
    }
});

function loadGifts() {
    if (typeof db !== 'undefined') {
        db.collection('gifts').onSnapshot((snapshot) => {
            allGifts = [];
            snapshot.forEach((doc) => {
                allGifts.push({ id: doc.id, ...doc.data() });
            });
            renderGifts('todos');
        }, (error) => {
            console.error("Erro ao carregar do Firestore, carregando lista padrão:", error);
            loadDefaultGifts();
        });
    } else {
        loadDefaultGifts();
    }
}

function loadDefaultGifts() {
    allGifts = [
        { id: '1', name: 'Geladeira', category: 'Cozinha', price: 3500, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', description: 'Inox Frost Free 400L', status: 'disponivel' },
        { id: '2', name: 'Fogão / Cooktop', category: 'Cozinha', price: 1200, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', description: '5 bocas mesa de vidro', status: 'disponivel' },
        { id: '3', name: 'Forno Elétrico', category: 'Cozinha', price: 900, image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80', description: 'De embutir 60L', status: 'disponivel' },
        { id: '4', name: 'Micro-ondas', category: 'Cozinha', price: 650, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80', description: 'Espelhado 30L', status: 'disponivel' },
        { id: '5', name: 'Air Fryer', category: 'Cozinha', price: 500, image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=400&q=80', description: 'Fritadeira sem óleo 5L', status: 'disponivel' },
        { id: '6', name: 'Jogo de panelas completo', category: 'Cozinha', price: 450, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80', description: 'Antiaderente 5 peças', status: 'disponivel' },
        { id: '7', name: 'Sofá', category: 'Sala', price: 2500, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80', description: 'Retrátil e reclinável 3 lugares', status: 'disponivel' },
        { id: '8', name: 'TV', category: 'Sala', price: 2800, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', description: 'Smart TV 55 polegadas 4K', status: 'disponivel' },
        { id: '9', name: 'Cama', category: 'Quarto', price: 2000, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80', description: 'Box Queen Size', status: 'disponivel' },
        { id: '10', name: 'Máquina de lavar', category: 'Lavanderia', price: 2400, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80', description: '13kg abertura frontal', status: 'disponivel' }
    ];
    renderGifts('todos');
}

function renderGifts(category) {
    const grid = document.getElementById('giftsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = category === 'todos' ? allGifts : allGifts.filter(g => g.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Nenhum presente encontrado nesta categoria.</p>';
        return;
    }

    filtered.forEach(gift => {
        const isReserved = gift.status === 'reservado';
        const card = document.createElement('div');
        card.className = `gift-card ${isReserved ? 'reserved' : ''}`;
        card.innerHTML = `
            <div class="gift-img-wrapper">
                <img src="${gift.image}" alt="${gift.name}" loading="lazy">
                <span class="gift-badge">${gift.category}</span>
            </div>
            <div class="gift-info">
                <h3>${gift.name}</h3>
                <p class="gift-price">R$ ${Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p class="gift-desc">${gift.description || ''}</p>
                ${isReserved ? 
                    '<button class="btn btn-secondary btn-full" disabled>Indisponível</button>' : 
                    `<div style="display:flex; gap:10px;">
                        <button class="btn btn-primary btn-full" onclick="openGiftModal('${gift.id}')">Presentear</button>
                        <button class="btn btn-secondary" onclick="addToCart('${gift.id}')" title="Adicionar ao Carrinho">🛒</button>
                     </div>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

function openGiftModal(id) {
    const gift = allGifts.find(g => g.id === id);
    if (!gift) return;

    document.getElementById('modalGiftId').value = gift.id;
    document.getElementById('modalGiftName').innerText = gift.name;
    document.getElementById('modalGiftPrice').innerText = `R$ ${Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('modalGiftDesc').innerText = gift.description || '';
    
    document.getElementById('giftModal').classList.add('active');
}

function addToCart(id) {
    const gift = allGifts.find(g => g.id === id);
    if (!gift || gift.status === 'reservado') return;

    if (cart.some(item => item.id === id)) {
        alert("Este item já está no seu carrinho.");
        return;
    }

    cart.push(gift);
    updateCartBar();
    alert(`"${gift.name}" foi adicionado ao carrinho!`);
}

function updateCartBar() {
    const cartBar = document.getElementById('cartBar');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length > 0) {
        cartBar.style.display = 'flex';
        cartCount.innerText = cart.length;
        const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
        cartTotal.innerText = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    } else {
        cartBar.style.display = 'none';
    }
}

function renderCartModal() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartModalTotal');
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Seu carrinho está vazio.</p>';
        totalEl.innerText = 'R$ 0,00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += Number(item.price);
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        `;
        list.appendChild(row);
    });

    totalEl.innerText = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
