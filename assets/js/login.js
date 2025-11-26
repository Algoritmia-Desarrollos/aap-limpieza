// js/login.js
import { supabase } from './supabaseClient.js'

const inputs = document.querySelectorAll('.pin-input');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

// --- 1. Control de Inputs (UX) ---
inputs.forEach((input, index) => {
    // Al escribir un número, pasar al siguiente
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    // Al presionar borrar o enter
    input.addEventListener('keydown', (e) => {
        // Borrar: volver atrás
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
        // Enter en el último: Login
        if (e.key === 'Enter' && index === inputs.length - 1) {
            iniciarSesion();
        }
    });
});

// --- 2. Lógica de Login ---
async function iniciarSesion() {
    // 1. Obtener el PIN completo
    let pin = '';
    inputs.forEach(input => pin += input.value);

    // 2. Validar longitud
    if (pin.length !== 4) {
        mostrarError("Ingresa los 4 dígitos");
        return;
    }

    // 3. UI de carga
    loginBtn.innerHTML = '<div class="loader"></div>'; // Spinner
    loginBtn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
        console.log("Verificando PIN:", pin);

        // 4. Consulta a Supabase
        const { data, error } = await supabase
            .from('limp_usuarios')
            .select('*')
            .eq('pin', pin)
            .eq('activo', true) // Solo usuarios activos
            .single();

        if (error || !data) {
            console.warn("Login fallido:", error);
            mostrarError("PIN incorrecto o usuario inactivo");
            resetButton();
            return;
        }

        // 5. ÉXITO
        console.log("Bienvenido:", data.nombre);
        
        // Guardar sesión en el navegador
        localStorage.setItem('cvo_usuario', JSON.stringify(data));

        // Redirigir según rol
        setTimeout(() => {
            if (data.rol === 'admin') {
                window.location.href = 'admin_dashboard.html'; // Asegúrate de crear este archivo luego
            } else {
                window.location.href = 'operario_dashboard.html'; // Asegúrate de crear este archivo luego
            }
        }, 500);

    } catch (err) {
        console.error("Error de red:", err);
        mostrarError("Error de conexión");
        resetButton();
    }
}

// --- Helpers ---
function mostrarError(texto) {
    errorMsg.innerText = texto;
    errorMsg.classList.remove('hidden');
    // Vibración en móviles
    if(navigator.vibrate) navigator.vibrate(200);
}

function resetButton() {
    loginBtn.innerHTML = 'INGRESAR';
    loginBtn.disabled = false;
    // Limpiar inputs
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
}

// Escuchar click en el botón
loginBtn.addEventListener('click', iniciarSesion);