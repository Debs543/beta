// reserva.js

// Variables globales
let currentStep = 1;
const totalSteps = 4;

// Elementos del DOM
const form = document.getElementById('reservationForm');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const btnNext = document.querySelectorAll('.btn-next');
const btnPrev = document.querySelectorAll('.btn-prev');
const btnSubmit = document.querySelector('.btn-submit');

// Mensajes
const formMessages = document.getElementById('form-messages');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    updateProgress();
    setMinDates();
});

function initializeForm() {
    showStep(1);
    updateProgress();
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('llegada').min = today;
    document.getElementById('salida').min = today;
}

function setupEventListeners() {
    // Botones de navegación
    btnNext.forEach(button => {
        button.addEventListener('click', nextStep);
    });
    
    btnPrev.forEach(button => {
        button.addEventListener('click', prevStep);
    });
    
    // Botón de confirmar reserva
    if (btnSubmit) {
        btnSubmit.addEventListener('click', handleSubmit);
    }

    // Actualizar resumen cuando cambien los campos
    setupFormChangeListeners();
    
    // Configurar campos dinámicos de pago
    setupPaymentFields();
    
    // Configurar formato de tarjeta
    setupCardFormatting();
}

function setupFormChangeListeners() {
    // Campos que afectan el resumen
    const fieldsToWatch = [
        'nombre', 'apellido', 'email', 'telefono', 'llegada', 'salida', 
        'huespedes', 'cabana', 'metodo_pago'
    ];
    
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateSummary);
            field.addEventListener('input', updateSummary);
        }
    });
    
    // Servicios
    const serviciosCheckboxes = document.querySelectorAll('input[name="servicios[]"]');
    serviciosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSummary);
        checkbox.addEventListener('change', updatePaymentAmount);
    });
}

function setupPaymentFields() {
    const metodoPago = document.getElementById('metodo_pago');
    if (metodoPago) {
        metodoPago.addEventListener('change', showPaymentFields);
    }
}

function setupCardFormatting() {
    // Formato de número de tarjeta
    const numeroTarjeta = document.getElementById('numero_tarjeta');
    if (numeroTarjeta) {
        numeroTarjeta.addEventListener('input', formatCardNumber);
    }
    
    // Formato de fecha de vencimiento
    const fechaVencimiento = document.getElementById('fecha_vencimiento');
    if (fechaVencimiento) {
        fechaVencimiento.addEventListener('input', formatExpiryDate);
    }
    
    // Formato de CVV
    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', formatCVV);
    }
}

function showPaymentFields() {
    const metodoPago = document.getElementById('metodo_pago').value;
    const camposAdicionales = document.getElementById('campos-pago-adicionales');
    
    // Ocultar todos los campos primero
    document.querySelectorAll('.campos-pago').forEach(campo => {
        campo.style.display = 'none';
    });
    
    // Mostrar campos según el método seleccionado
    if (metodoPago === 'tarjeta') {
        document.getElementById('campos-tarjeta').style.display = 'block';
        camposAdicionales.style.display = 'block';
    } else if (metodoPago === 'transferencia') {
        document.getElementById('campos-transferencia').style.display = 'block';
        camposAdicionales.style.display = 'block';
    } else if (metodoPago === 'deposito') {
        document.getElementById('campos-deposito').style.display = 'block';
        camposAdicionales.style.display = 'block';
    } else if (metodoPago === 'efectivo') {
        document.getElementById('campos-efectivo').style.display = 'block';
        camposAdicionales.style.display = 'block';
        updatePaymentAmount();
    } else {
        camposAdicionales.style.display = 'none';
    }
}

function updatePaymentAmount() {
    const montoEfectivo = document.getElementById('monto_efectivo');
    if (montoEfectivo) {
        const costos = calculateTotal();
        montoEfectivo.value = `L.${costos.total.toFixed(2)}`;
    }
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
}

function nextStep() {
    if (currentStep < totalSteps) {
        if (validateCurrentStep()) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
            
            // Si llegamos al paso 4, actualizar el resumen
            if (currentStep === 4) {
                updateSummary();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function showStep(step) {
    formSteps.forEach((stepElement, index) => {
        stepElement.classList.toggle('active', index + 1 === step);
    });
}

    function updateProgress() {
        progressSteps.forEach((step, index) => {
        if (index + 1 < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
        } else if (index + 1 === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

    // Validaciones específicas por paso
        if (currentStep === 2) {
        const llegada = document.getElementById('llegada').value;
        const salida = document.getElementById('salida').value;
        
        if (llegada && salida) {
            const llegadaDate = new Date(llegada);
            const salidaDate = new Date(salida);
            
            if (salidaDate <= llegadaDate) {
                document.getElementById('salida').classList.add('error');
                showError('La fecha de salida debe ser posterior a la fecha de llegada.');
                isValid = false;
            }
            }
        }

        if (!isValid) {
        showError('Por favor, complete todos los campos requeridos correctamente.');
        }

        return isValid;
    }

function updateSummary() {
    // Información personal
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    
    if (nombre && apellido) {
        document.getElementById('summary-nombre').textContent = `${nombre} ${apellido}`;
    }
    if (email) {
        document.getElementById('summary-email').textContent = email;
    }
    if (telefono) {
        document.getElementById('summary-telefono').textContent = telefono;
    }
    
    // Detalles de reserva
    const llegada = document.getElementById('llegada').value;
    const salida = document.getElementById('salida').value;
    const huespedes = document.getElementById('huespedes').value;
    const cabana = document.getElementById('cabana');
    
    if (llegada) {
        document.getElementById('summary-llegada').textContent = formatDate(llegada);
    }
    if (salida) {
        document.getElementById('summary-salida').textContent = formatDate(salida);
    }
    if (huespedes) {
        document.getElementById('summary-huespedes').textContent = huespedes;
    }
    if (cabana.selectedIndex > 0) {
        document.getElementById('summary-cabana').textContent = cabana.selectedOptions[0].text;
    }
    
    // Servicios seleccionados
    updateServicesSummary();
    
    // Costos
    updateCosts();
}

function updateServicesSummary() {
    const serviciosDiv = document.getElementById('summary-servicios');
    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios[]"]:checked');
    
    if (serviciosSeleccionados.length > 0) {
        let serviciosHTML = '';
        serviciosSeleccionados.forEach(servicio => {
            const label = document.querySelector(`label[for="${servicio.id}"]`).textContent;
            serviciosHTML += `<p>• ${label}</p>`;
        });
        serviciosDiv.innerHTML = serviciosHTML;
    } else {
        serviciosDiv.innerHTML = '<p>Ningún servicio adicional seleccionado</p>';
    }
}

function updateCosts() {
    const costos = calculateTotal();
    
    document.getElementById('costo-alojamiento').textContent = `L.${costos.alojamiento.toFixed(2)}`;
    document.getElementById('costo-servicios').textContent = `L.${costos.servicios.toFixed(2)}`;
    document.getElementById('subtotal').textContent = `L.${costos.subtotal.toFixed(2)}`;
    document.getElementById('iva').textContent = `L.${costos.iva.toFixed(2)}`;
    document.getElementById('total').textContent = `L.${costos.total.toFixed(2)}`;
}

    function calculateTotal() {
    const llegada = document.getElementById('llegada').value;
    const salida = document.getElementById('salida').value;
        const huespedes = parseInt(document.getElementById('huespedes').value) || 0;
    const cabana = document.getElementById('cabana');
        
        let alojamiento = 0;
    if (cabana.selectedIndex > 0 && llegada && salida) {
        const precioPorNoche = parseInt(cabana.selectedOptions[0].dataset.precio) || 0;
        const noches = calculateNights(llegada, salida);
            alojamiento = precioPorNoche * noches;
        }

        let servicios = 0;
        const serviciosSeleccionados = document.querySelectorAll('input[name="servicios[]"]:checked');
        serviciosSeleccionados.forEach(servicio => {
            let precioServicio = parseInt(servicio.dataset.precio) || 0;
        if (['tirolesa', 'cascada', 'kayak', 'aves', 'desayuno', 'almuerzo', 'cena', 'picnic'].includes(servicio.value)) {
                servicios += precioServicio * huespedes;
            } else {
                servicios += precioServicio;
            }
        });

        const subtotal = alojamiento + servicios;
        const iva = subtotal * 0.15;
        const total = subtotal + iva;

        return { alojamiento, servicios, subtotal, iva, total };
    }

function calculateNights(llegada, salida) {
    if (!llegada || !salida) return 1;
    const llegadaDate = new Date(llegada);
    const salidaDate = new Date(salida);
    const diffTime = salidaDate - llegadaDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Validar términos y condiciones
    const terminos = document.getElementById('terminos');
    if (!terminos || !terminos.checked) {
        showError('Debe aceptar los términos y condiciones para continuar.');
        return;
    }
    
    // Mostrar mensaje de procesamiento
    showSuccess('Procesando tu reserva...');
    
    // Enviar formulario usando FormSubmit
    sendReservationEmail();
}

function sendReservationEmail() {
    // Obtener todos los datos del formulario
    const formData = new FormData();
    
    // Configuración de FormSubmit
    formData.append('_subject', 'Nueva Reserva - Balneario Paraíso');
    formData.append('_captcha', 'false');
    
    // Datos personales
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellido', document.getElementById('apellido').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('telefono', document.getElementById('telefono').value);
    formData.append('whatsapp', document.getElementById('whatsapp').value);
    formData.append('identidad', document.getElementById('identidad').value);
    formData.append('direccion', document.getElementById('direccion').value);
    formData.append('ciudad', document.getElementById('ciudad').value);
    formData.append('pais', document.getElementById('pais').value);
    
    // Detalles de reserva
    formData.append('llegada', document.getElementById('llegada').value);
    formData.append('hora_llegada', document.getElementById('hora_llegada').value);
    formData.append('salida', document.getElementById('salida').value);
    formData.append('hora_salida', document.getElementById('hora_salida').value);
    formData.append('huespedes', document.getElementById('huespedes').value);
    formData.append('ninos', document.getElementById('ninos').value);
    formData.append('cabana', document.getElementById('cabana').selectedOptions[0]?.text || '');
    formData.append('metodo_pago', document.getElementById('metodo_pago').selectedOptions[0]?.text || '');
    
    // Información adicional de pago según el método seleccionado
    const metodoPago = document.getElementById('metodo_pago').value;
    if (metodoPago === 'tarjeta') {
        formData.append('numero_tarjeta', document.getElementById('numero_tarjeta').value);
        formData.append('titular_tarjeta', document.getElementById('titular_tarjeta').value);
        formData.append('fecha_vencimiento', document.getElementById('fecha_vencimiento').value);
        formData.append('cvv', document.getElementById('cvv').value);
        formData.append('tipo_tarjeta', document.getElementById('tipo_tarjeta').value);
    } else if (metodoPago === 'transferencia') {
        formData.append('banco_origen', document.getElementById('banco_origen').value);
        formData.append('cuenta_origen', document.getElementById('cuenta_origen').value);
        formData.append('fecha_transferencia', document.getElementById('fecha_transferencia').value);
        formData.append('referencia_transferencia', document.getElementById('referencia_transferencia').value);
    } else if (metodoPago === 'deposito') {
        formData.append('banco_deposito', document.getElementById('banco_deposito').value);
        formData.append('cuenta_deposito', document.getElementById('cuenta_deposito').value);
        formData.append('fecha_deposito', document.getElementById('fecha_deposito').value);
        formData.append('referencia_deposito', document.getElementById('referencia_deposito').value);
    } else if (metodoPago === 'efectivo') {
        formData.append('monto_efectivo', document.getElementById('monto_efectivo').value);
        formData.append('moneda_efectivo', document.getElementById('moneda_efectivo').value);
    }
    
    // Servicios seleccionados
        const serviciosSeleccionados = document.querySelectorAll('input[name="servicios[]"]:checked');
    let serviciosText = '';
            serviciosSeleccionados.forEach(servicio => {
                const label = document.querySelector(`label[for="${servicio.id}"]`).textContent;
        serviciosText += `• ${label}\n`;
    });
    formData.append('servicios', serviciosText || 'Ningún servicio adicional');
    
    // Comentarios
    formData.append('comentarios', document.getElementById('comentarios').value);
    
    // Costos
    const costos = calculateTotal();
    formData.append('costo_alojamiento', `L.${costos.alojamiento.toFixed(2)}`);
    formData.append('costo_servicios', `L.${costos.servicios.toFixed(2)}`);
    formData.append('subtotal', `L.${costos.subtotal.toFixed(2)}`);
    formData.append('iva', `L.${costos.iva.toFixed(2)}`);
    formData.append('total', `L.${costos.total.toFixed(2)}`);
    
    // Enviar usando FormSubmit
    fetch('https://formsubmit.co/deboraguifarro@gmail.com', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('Reserva enviada exitosamente');
            showSuccess('¡Reserva confirmada exitosamente! Se ha enviado un correo de confirmación.');
            
            // Limpiar formulario después de 3 segundos
            setTimeout(() => {
                form.reset();
                currentStep = 1;
                showStep(1);
                updateProgress();
                clearSummary();
                // Ocultar campos de pago
                document.getElementById('campos-pago-adicionales').style.display = 'none';
            }, 3000);
        } else {
            console.log('Error al enviar reserva');
            showError('Hubo un problema al procesar tu reserva. Por favor, inténtalo de nuevo.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Hubo un problema al procesar tu reserva. Por favor, inténtalo de nuevo.');
    });
}

function clearSummary() {
    // Limpiar todos los campos del resumen
    const summaryFields = [
        'summary-nombre', 'summary-email', 'summary-telefono',
        'summary-llegada', 'summary-salida', 'summary-huespedes', 'summary-cabana'
    ];
    
    summaryFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.textContent = '';
    });
    
    document.getElementById('summary-servicios').innerHTML = '';
    document.getElementById('costo-alojamiento').textContent = 'L.0.00';
    document.getElementById('costo-servicios').textContent = 'L.0.00';
    document.getElementById('subtotal').textContent = 'L.0.00';
    document.getElementById('iva').textContent = 'L.0.00';
    document.getElementById('total').textContent = 'L.0.00';
    }

    function showSuccess(message) {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.textContent = message;
        formMessages.style.display = 'block';
    
    // Mostrar mensaje de éxito más prominente
    const mensajeConfirmacion = document.getElementById('mensaje-confirmacion');
    if (mensajeConfirmacion) {
        mensajeConfirmacion.innerHTML = `
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border-radius: 15px; margin: 20px 0; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                <h3 style="margin: 0 0 15px 0; font-size: 1.5em;">✅ ¡Reserva Confirmada!</h3>
                <p style="margin: 0; font-size: 1.1em;">${message}</p>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.9;">Se ha enviado un correo de confirmación a tu email</p>
            </div>
        `;
        mensajeConfirmacion.style.display = 'block';
        
        // Ocultar después de 8 segundos
            setTimeout(() => {
            mensajeConfirmacion.style.display = 'none';
        }, 8000);
    }
}

function showError(message) {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
    formMessages.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        formMessages.style.display = 'none';
    }, 5000);
} 