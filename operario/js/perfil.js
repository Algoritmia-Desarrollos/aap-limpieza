import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';
import { toast } from '../../assets/js/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkSession('operario');
    if (!user) return;

    renderBottomNav('perfil');
    loadProfile(user);

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        localStorage.removeItem('cvo_usuario');
        window.location.href = '../index.html';
    });
});

async function loadProfile(user) {
    try {
        // El usuario ya viene de localStorage con todos los datos
        document.getElementById('userName').textContent = user.nombre;
        document.getElementById('userInitials').textContent = user.nombre.substring(0, 2).toUpperCase();
        document.getElementById('userPin').textContent = user.pin;
        
        // Si el usuario tiene email en el objeto, mostrarlo
        if (user.email) {
            document.getElementById('userEmail').textContent = user.email;
        } else {
            document.getElementById('userEmail').textContent = 'No disponible';
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar perfil');
    }
}
