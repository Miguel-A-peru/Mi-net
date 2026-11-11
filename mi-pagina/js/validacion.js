/*
 * Validación accesible del formulario de consulta de MI NET.
 * - Usa la API de validación del navegador (required, pattern, min, max...).
 * - Muestra mensajes claros debajo de cada campo y un resumen al enviar.
 * - Marca los campos con aria-invalid y mueve el foco al resumen.
 */
(function () {
    'use strict';

    var form = document.getElementById('form-consulta');
    if (!form) {
        return;
    }

    var resumen = document.getElementById('resumen-errores');
    var lista = document.getElementById('lista-errores');
    var exito = document.getElementById('mensaje-exito');

    // Etiqueta corta de cada campo, usada en el resumen de errores
    var nombres = {
        nombre: 'Nombres y apellidos',
        correo: 'Correo electrónico',
        telefono: 'Celular',
        producto: 'Producto de interés',
        cantidad: 'Cantidad',
        fecha: 'Fecha en que lo necesitas',
        acepto: 'Consentimiento de uso de datos'
    };

    // Mensajes de error: dicen qué corregir
    var mensajes = {
        nombre: {
            valueMissing: 'Escribe tus nombres y apellidos.',
            tooShort: 'Escribe al menos 3 letras.',
            patternMismatch: 'Usa solo letras y espacios, sin números ni símbolos.'
        },
        correo: {
            valueMissing: 'Escribe tu correo electrónico.',
            typeMismatch: 'Escribe un correo válido, por ejemplo nombre@correo.com.'
        },
        telefono: {
            valueMissing: 'Escribe tu número de celular.',
            patternMismatch: 'El celular debe tener 9 dígitos y empezar con 9, por ejemplo 987654321.'
        },
        producto: {
            valueMissing: 'Selecciona un producto de la lista.'
        },
        cantidad: {
            valueMissing: 'Escribe la cantidad que necesitas.',
            badInput: 'Escribe la cantidad usando solo números.',
            rangeUnderflow: 'La cantidad mínima es 1.',
            rangeOverflow: 'La cantidad máxima es 20. Para más unidades, escríbenos por WhatsApp.',
            stepMismatch: 'Escribe un número entero, sin decimales.'
        },
        fecha: {
            badInput: 'Escribe una fecha válida.',
            rangeUnderflow: 'Elige una fecha de hoy en adelante.'
        },
        acepto: {
            valueMissing: 'Marca la casilla para poder enviar tu consulta.'
        }
    };

    // La fecha no puede ser pasada: se fija el mínimo con la fecha de hoy
    var campoFecha = form.elements.fecha;
    if (campoFecha) {
        var hoy = new Date();
        var mes = String(hoy.getMonth() + 1).padStart(2, '0');
        var dia = String(hoy.getDate()).padStart(2, '0');
        campoFecha.min = hoy.getFullYear() + '-' + mes + '-' + dia;
    }

    // Devuelve el texto de error de un campo, o '' si es válido
    function obtenerMensaje(campo) {
        if (campo.validity.valid) {
            return '';
        }
        var propios = mensajes[campo.name] || {};
        var tipos = ['valueMissing', 'typeMismatch', 'badInput', 'patternMismatch',
            'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch'];
        for (var i = 0; i < tipos.length; i++) {
            if (campo.validity[tipos[i]] && propios[tipos[i]]) {
                return propios[tipos[i]];
            }
        }
        return 'Revisa este campo.';
    }

    // Muestra u oculta el error de un campo. Devuelve true si es válido
    function validarCampo(campo) {
        var contenedor = document.getElementById('error-' + campo.name);
        var mensaje = obtenerMensaje(campo);

        if (contenedor) {
            contenedor.textContent = mensaje;
        }
        if (mensaje) {
            campo.setAttribute('aria-invalid', 'true');
            return false;
        }
        campo.removeAttribute('aria-invalid');
        return true;
    }

    function ocultarResumen() {
        resumen.hidden = true;
        lista.innerHTML = '';
    }

    // Construye el resumen con enlaces que llevan al campo con error
    function mostrarResumen(invalidos) {
        lista.innerHTML = '';
        invalidos.forEach(function (campo) {
            var item = document.createElement('li');
            var enlace = document.createElement('a');
            enlace.href = '#' + campo.id;
            enlace.textContent = nombres[campo.name] + ': ' + obtenerMensaje(campo);
            enlace.addEventListener('click', function (evento) {
                evento.preventDefault();
                campo.focus();
            });
            item.appendChild(enlace);
            lista.appendChild(item);
        });
        resumen.hidden = false;
        resumen.focus();
    }

    // Validar al salir de un campo y corregir el mensaje mientras se escribe
    Array.prototype.forEach.call(form.elements, function (campo) {
        if (!campo.name || campo.type === 'submit') {
            return;
        }
        campo.addEventListener('blur', function () {
            if (campo.value !== '' || campo.hasAttribute('aria-invalid')) {
                validarCampo(campo);
            }
        });
        var evento = (campo.type === 'checkbox' || campo.tagName === 'SELECT') ? 'change' : 'input';
        campo.addEventListener(evento, function () {
            if (campo.hasAttribute('aria-invalid')) {
                validarCampo(campo);
            }
        });
    });

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
        exito.hidden = true;

        var invalidos = [];
        Array.prototype.forEach.call(form.elements, function (campo) {
            if (campo.name && campo.type !== 'submit' && !validarCampo(campo)) {
                invalidos.push(campo);
            }
        });

        if (invalidos.length > 0) {
            mostrarResumen(invalidos);
            return;
        }

        ocultarResumen();

        // Aquí se enviaría el formulario a un servidor.
        // En este proyecto solo se simula el envío con datos de prueba.
        form.reset();
        exito.hidden = false;
        exito.focus();
    });
})();