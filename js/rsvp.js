document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvpForm');
    const feedback = document.getElementById('rsvpFeedback');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('rsvpName').value;
            const guests = parseInt(document.getElementById('rsvpGuests').value);
            const attendance = document.getElementById('rsvpAttendance').value;

            feedback.style.display = 'block';
            feedback.className = 'form-feedback';
            feedback.innerText = 'Enviando confirmação...';

            try {
                if (typeof db !== 'undefined') {
                    await db.collection('rsvp').add({
                        name: name,
                        guestsCount: guests,
                        attendance: attendance,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                feedback.className = 'form-feedback success';
                feedback.innerText = attendance === 'sim' 
                    ? `Obrigado, ${name}! Sua presença foi confirmada com sucesso.` 
                    : `Recebemos sua resposta, ${name}. Sentiremos sua falta no grande dia!`;
                
                rsvpForm.reset();
            } catch (error) {
                console.error("Erro ao enviar RSVP:", error);
                feedback.className = 'form-feedback error';
                feedback.innerText = 'Erro ao enviar confirmação. Tente novamente.';
            }
        });
    }
});
