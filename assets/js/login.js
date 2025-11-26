// assets/js/login.js
import { supabase } from './supabaseClient.js'
import { toast } from './toast.js'

const inputs = document.querySelectorAll('.pin-input');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

// --- 1. Control de Inputs (UX: Salto automático) ---
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
    // 1. Obtener el PIN completo concatenando los inputs
    let pin = '';
    inputs.forEach(input => pin += input.value);

    // 2. Validar longitud
    if (pin.length !== 4) {
        toast.warning("Ingresa los 4 dígitos del PIN");
        return;
    }

    // 3. UI de carga (Spinner)
    const btnTextoOriginal = loginBtn.innerHTML;
    loginBtn.innerHTML = '<div class="loader"></div>'; 
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
            toast.error("PIN incorrecto o usuario inactivo");
            resetButton(btnTextoOriginal);
            return;
        }

        // 5. ÉXITO
        console.log("Bienvenido:", data.nombre);
        
        // Guardar sesión en el navegador
        localStorage.setItem('cvo_usuario', JSON.stringify(data));

        // Mostrar éxito
        toast.success(`¡Bienvenido, ${data.nombre}!`);

        // --- REDIRECCIÓN CORREGIDA (Rutas con carpetas) ---
        setTimeout(() => {
            if (data.rol === 'admin') {
                window.location.href = 'admin/dashboard.html'; 
            } else {
                window.location.href = 'operario/dashboard.html'; 
            }
        }, 800);

    } catch (err) {
        console.error("Error de red:", err);
        toast.error("Error de conexión. Verifica tu internet.");
        resetButton(btnTextoOriginal);
    }
}

// --- Helpers ---
function mostrarError(texto) {
    errorMsg.innerText = texto;
    errorMsg.classList.remove('hidden');
    // Vibración en móviles para feedback táctil
    if(navigator.vibrate) navigator.vibrate(200);
}

function resetButton(textoOriginal = 'INGRESAR') {
    loginBtn.innerHTML = textoOriginal;
    loginBtn.disabled = false;
    // Limpiar inputs y enfocar el primero
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
}

// Escuchar click en el botón
loginBtn.addEventListener('click', iniciarSesion);