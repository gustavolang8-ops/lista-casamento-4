document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                loginScreen.style.display = 'none';
                adminDashboard.style.display = 'block';
                loadAdminData();
            } else {
                loginScreen.style.display = 'flex';
                adminDashboard.style.display = 'none';
            }
        });
    } else {
        // Modo demo se o Firebase não estiver ativo
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadAdminData();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            loginError.style.display = 'none';

            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (error) {
                console.error("Erro no login:", error);
                loginError.style.display = 'block';
                loginError.innerText = 'Credenciais inválidas ou acesso não autorizado.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof auth !== 'undefined') auth.signOut();
            else location.reload();
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetTab = e.target.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    const adminGiftModal = document.getElementById('adminGiftModal');
    const openAddGiftModal = document.getElementById('openAddGiftModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const adminGiftForm = document.getElementById('adminGiftForm');

    if (openAddGiftModal) {
        openAddGiftModal.addEventListener('click', () => {
            document.getElementById('adminModalTitle').innerText = 'Adicionar Novo Presente';
            document.getElementById('editGiftId').value = '';
            adminGiftForm.reset();
            adminGiftModal.classList.add('active');
        });
    }

    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', () => adminGiftModal.classList.remove('active'));
    }

    if (adminGiftForm) {
        adminGiftForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editGiftId').value;
            const giftData = {
                name: document.getElementById('editName').value,
                category: document.getElementById('editCategory').value,
                price: parseFloat(document.getElementById('editPrice').value),
                image: document.getElementById('editImage').value,
                description: document.getElementById('editDesc').value,
                status: 'disponivel'
            };

            try {
                if (typeof db !== 'undefined') {
                    if (id) {
                        await db.collection('gifts').doc(id).update(giftData);
                    } else {
                        await db.collection('gifts').add(giftData);
                    }
                }
                alert('Presente salvo com sucesso!');
                adminGiftModal.classList.remove('active');
                loadAdminData();
            } catch (error) {
                console.error("Erro ao salvar presente:", error);
                alert("Erro ao salvar dados.");
            }
        });
    }
});

function loadAdminData() {
    loadAdminGifts();
    loadAdminReservations();
    loadAdminRsvp();
}

function loadAdminGifts() {
    if (typeof db !== 'undefined') {
        db.collection('gifts').onSnapshot((snapshot) => {
            const tbody = document.querySelector('#adminGiftsTable tbody');
            tbody.innerHTML = '';
            
            let total = 0, available = 0, reserved = 0;

            snapshot.forEach((doc) => {
                const gift = { id: doc.id, ...doc.data() };
                total++;
                if (gift.status === 'reservado') reserved++;
                else available++;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${gift.image}" class="table-img" alt=""></td>
                    <td>${gift.name}</td>
                    <td>${gift.category}</td>
                    <td>R$ ${Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td><span style="color: ${gift.status === 'reservado' ? 'var(--danger)' : 'var(--success)'}; font-weight:600;">${gift.status}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn btn-secondary btn-sm" onclick="editGift('${gift.id}', '${gift.name}', '${gift.category}', ${gift.price}, '${gift.image}', '${gift.description}')">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteGift('${gift.id}')">Excluir</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('statTotalGifts').innerText = total;
            document.getElementById('statAvailableGifts').innerText = available;
            document.getElementById('statReservedGifts').innerText = reserved;
        });
    } else {
        document.getElementById('statTotalGifts').innerText = '10';
        document.getElementById('statAvailableGifts').innerText = '10';
        document.getElementById('statReservedGifts').innerText = '0';
    }
}

function editGift(id, name, category, price, image, description) {
    document.getElementById('adminModalTitle').innerText = 'Editar Presente';
    document.getElementById('editGiftId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editCategory').value = category;
    document.getElementById('editPrice').value = price;
    document.getElementById('editImage').value = image;
    document.getElementById('editDesc').value = description;
    document.getElementById('adminGiftModal').classList.add('active');
}

async function deleteGift(id) {
    if (confirm("Tem certeza que deseja excluir este presente?")) {
        try {
            if (typeof db !== 'undefined') {
                await db.collection('gifts').doc(id).delete();
            }
            alert("Presente excluído com sucesso.");
            loadAdminGifts();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir.");
        }
    }
}

function loadAdminReservations() {
    if (typeof db !== 'undefined') {
        db.collection('reservations_log').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            const tbody = document.querySelector('#adminReservationsTable tbody');
            tbody.innerHTML = '';

            snapshot.render((doc) => {
                const res = doc.data();
                const date = res.createdAt ? res.createdAt.toDate().toLocaleDateString('pt-BR') : 'recente';
                const tr = document.createElement('tr');
                const itemsText = res.giftName ? res.giftName : (res.items ? res.items.map(i => i.name).join(', ') : 'Diversos');

                tr.innerHTML = `
                    <td>${res.guestName || 'Convidado'}</td>
                    <td>${itemsText}</td>
                    <td>${res.message || 'Sem recado'}</td>
                    <td>${date}</td>
                `;
                tbody.appendChild(tr);
            });
        });
    }
}

function loadAdminRsvp() {
    if (typeof db !== 'undefined') {
        db.collection('rsvp').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            const tbody = document.querySelector('#adminRsvpTable tbody');
            tbody.innerHTML = '';
            
            let totalRsvp = 0;
            snapshot.forEach((doc) => {
                const rsvp = doc.data();
                totalRsvp++;

                const date = rsvp.createdAt ? rsvp.createdAt.toDate().toLocaleDateString('pt-BR') : 'recente';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rsvp.name}</td>
                    <td>${rsvp.guestsCount}</td>
                    <td><span style="color: ${rsvp.attendance === 'sim' ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${rsvp.attendance.toUpperCase()}</span></td>
                    <td>${date}</td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('statTotalRsvp').innerText = totalRsvp;
        });
    } else {
        document.getElementById('statTotalRsvp').innerText = '0';
    }
}
