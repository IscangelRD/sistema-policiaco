document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menuBtn =
            document.getElementById("menuBtn");

        const sidebar =
            document.getElementById("sidebar");

        const overlay =
            document.getElementById("overlay");

        const nombreUsuario =
            document.getElementById("nombreUsuario");

        const rolUsuario =
            document.getElementById("rolUsuario");

        const btnLogout =
            document.getElementById("btnLogout");

        const tabla =
            document.getElementById("tablaPersonal");

        const buscar =
            document.getElementById("buscarPersonal");

        const filtroCorporacion =
            document.getElementById("filtroCorporacion");

        const filtroEstado =
            document.getElementById("filtroEstadoPersonal");

        const btnNuevo =
            document.getElementById("btnNuevoPersonal");

        const modal =
            document.getElementById("modalPersonal");

        const form =
            document.getElementById("formPersonal");

        const selectCorporacion =
            document.getElementById("personalCorporacion");

        const btnGuardar =
            document.getElementById("btnGuardarPersonal");

        const mensaje =
            document.getElementById("mensajePersonal");

        let rolActual = null;
        let temporizador = null;


        menuBtn?.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle("activo");
                overlay.classList.toggle("activo");

            }
        );


        overlay?.addEventListener(
            "click",
            () => {

                sidebar.classList.remove("activo");
                overlay.classList.remove("activo");

            }
        );


        async function cargarUsuario() {

            const respuesta =
                await fetch("../api/auth/me.php");

            const data =
                await respuesta.json();

            if (!data.ok) {

                window.location.href =
                    "login.html";

                return false;
            }

            nombreUsuario.textContent =
                data.data.usuario;

            rolUsuario.textContent =
                data.data.rol;

            rolActual =
                data.data.rol;

            if (
                rolActual !==
                "Administrador"
            ) {

                btnNuevo.style.display =
                    "none";

            }

            return true;
        }


        btnLogout?.addEventListener(
            "click",
            async () => {

                await fetch(
                    "../api/auth/logout.php"
                );

                window.location.href =
                    "login.html";

            }
        );


        function escapar(valor) {

            return String(valor ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

        }


        function claseEstado(
            estado
        ) {

            if (estado === "Activo") {
                return "badge-activo";
            }

            if (
                estado ===
                "Suspendido"
            ) {
                return "badge-investigado";
            }

            return "badge-suspendido";

        }


        async function cargarCorporaciones() {

            const respuesta =
                await fetch(
                    "../api/corporaciones/listar.php"
                );

            const data =
                await respuesta.json();

            if (!data.ok) {
                return;
            }

            filtroCorporacion.innerHTML = `
                <option value="">
                    Todas las corporaciones
                </option>
            `;

            selectCorporacion.innerHTML = `
                <option value="">
                    Seleccionar corporación
                </option>
            `;

            data.data.forEach(
                corporacion => {

                    const opcionFiltro =
                        document.createElement(
                            "option"
                        );

                    opcionFiltro.value =
                        corporacion.id;

                    opcionFiltro.textContent =
                        corporacion.nombre;

                    filtroCorporacion.appendChild(
                        opcionFiltro
                    );


                    const opcionFormulario =
                        opcionFiltro.cloneNode(
                            true
                        );

                    selectCorporacion.appendChild(
                        opcionFormulario
                    );

                }
            );

        }


        async function cargarPersonal() {

            const url =
                new URL(
                    "../api/personal/listar.php",
                    window.location.href
                );

            if (
                buscar.value.trim()
            ) {

                url.searchParams.set(
                    "buscar",
                    buscar.value.trim()
                );

            }

            if (
                filtroCorporacion.value
            ) {

                url.searchParams.set(
                    "corporacion",
                    filtroCorporacion.value
                );

            }

            if (
                filtroEstado.value
            ) {

                url.searchParams.set(
                    "estado",
                    filtroEstado.value
                );

            }

            tabla.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="estado-tabla">
                            <div class="spinner"></div>
                            Consultando personal...
                        </div>
                    </td>
                </tr>
            `;


            try {

                const respuesta =
                    await fetch(url);

                const data =
                    await respuesta.json();

                if (!data.ok) {

                    throw new Error(
                        data.mensaje
                    );

                }

                renderizarPersonal(
                    data.data || []
                );

            } catch (error) {

                tabla.innerHTML = `
                    <tr>
                        <td colspan="8">
                            <div class="estado-tabla">
                                ${escapar(
                    error.message
                )}
                            </div>
                        </td>
                    </tr>
                `;

            }

        }

       function escapar(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatearFechaPersonal(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const valor = String(fecha);

    const fechaParte =
        valor.substring(0, 10);

    const partes =
        fechaParte.split("-");

    if (partes.length !== 3) {
        return escapar(fecha);
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}

function mostrarEstadoPersonal(estado) {

    let clase = "estado-activo-personal";
    let icono = "bi-check-circle-fill";

    if (estado === "Suspendido") {

        clase = "estado-suspendido-personal";
        icono = "bi-pause-circle-fill";

    }

    if (estado === "Baja") {

        clase = "estado-baja-personal";
        icono = "bi-x-circle-fill";

    }

    return `
        <span class="estado-personal ${clase}">
            <i class="bi ${icono}"></i>
            ${escapar(estado)}
        </span>
    `;
}


        function renderizarPersonal(
            personal
        ) {

            document.getElementById(
                "textoResultadosPersonal"
            ).textContent =
                `${personal.length} registro(s)`;


            document.getElementById(
                "totalPersonal"
            ).textContent =
                personal.length;


            document.getElementById(
                "totalPolicia"
            ).textContent =
                personal.filter(
                    p =>
                        p.corporacion ===
                        "Policia"
                ).length;


            document.getElementById(
                "totalMarina"
            ).textContent =
                personal.filter(
                    p =>
                        p.corporacion ===
                        "Marina"
                ).length;


            document.getElementById(
                "totalGN"
            ).textContent =
                personal.filter(
                    p =>
                        p.corporacion ===
                        "Guardia Nacional"
                ).length;


            if (
                personal.length === 0
            ) {

                tabla.innerHTML = `
                    <tr>
                        <td colspan="8">
                            <div class="estado-tabla">
                                No hay personal registrado.
                            </div>
                        </td>
                    </tr>
                `;

                return;

            }tabla.innerHTML =
    personal.map(
        p => {

            const nombre =
                p.nombre_completo ||
                "Nombre no registrado";

            const idInterno =
                p.id_interno ||
                "SIN-ID";

            const corporacion =
                p.corporacion ||
                obtenerNombreCorporacion(
                    p.corporacion_id
                );

            const rango =
                p.rango ||
                "Sin rango";

            const placa =
                p.placa_matricula ||
                "Sin registro";

            const zona =
                p.zona_asignada ||
                "Sin asignar";

            const estado =
                p.estado ||
                "Activo";

            const fecha =
                formatearFechaPersonal(
                    p.fecha_registro
                );


            return `

                <tr>

                    <!-- 1. PERSONAL -->

                    <td>

                        <div class="personal-identidad">

                            <div class="personal-avatar">

                                ${
                                    p.fotografia
                                        ? `
                                            <img
                                                src="../uploads/personal/${escapar(
                                                    p.fotografia
                                                )}"
                                                alt="Fotografía"
                                            >
                                        `
                                        : `
                                            <i class="bi bi-person-fill"></i>
                                        `
                                }

                            </div>


                            <div>

                                <strong>
                                    ${escapar(nombre)}
                                </strong>

                                <span>
                                    Registrado: ${fecha}
                                </span>

                            </div>

                        </div>

                    </td>


                    <!-- 2. ID INTERNO -->

                    <td>

                        <span class="personal-id">

                            ${escapar(idInterno)}

                        </span>

                    </td>


                    <!-- 3. CORPORACIÓN -->

                    <td>

                        <div class="corporacion-personal">

                            <div
                                class="logo-corporacion-tabla ${
                                    obtenerClaseCorporacion(
                                        p.corporacion_id
                                    )
                                }"
                            >

                                ${
                                    obtenerIconoCorporacion(
                                        p.corporacion_id
                                    )
                                }

                            </div>

                            <span>

                                ${escapar(corporacion)}

                            </span>

                        </div>

                    </td>


                    <!-- 4. RANGO -->

                    <td>

                        <span class="dato-personal">

                            ${escapar(rango)}

                        </span>

                    </td>


                    <!-- 5. PLACA / MATRÍCULA -->

                    <td>

                        <span class="placa-personal">

                            ${escapar(placa)}

                        </span>

                    </td>


                    <!-- 6. ZONA -->

                    <td>

                        <span class="dato-personal">

                            ${escapar(zona)}

                        </span>

                    </td>


                    <!-- 7. ESTADO -->

                    <td>

                        ${mostrarEstadoPersonal(
                            estado
                        )}

                    </td>


                    <!-- 8. ACCIONES -->

                    <td>

                        <div class="acciones-tabla">

                            <button
                                type="button"
                                class="btn-tabla"
                                data-personal="${p.id}"
                                title="Ver expediente"
                            >

                                <i class="bi bi-eye-fill"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }

    ).join("");


        }


        function abrirModal() {

            form.reset();

            document.getElementById(
                "personalEstado"
            ).value =
                "Activo";

            mensaje.className =
                "mensaje-formulario";

            modal.classList.add(
                "activo"
            );

            document.body.classList.add(
                "modal-abierto"
            );

        }


        function cerrarModal() {

            modal.classList.remove(
                "activo"
            );

            document.body.classList.remove(
                "modal-abierto"
            );

        }


        btnNuevo?.addEventListener(
            "click",
            abrirModal
        );


        document
            .querySelectorAll(
                "[data-cerrar-personal]"
            )
            .forEach(
                elemento => {

                    elemento.addEventListener(
                        "click",
                        cerrarModal
                    );

                }
            );


        form?.addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();


                const datos = {

                    corporacion_id:
                        selectCorporacion.value,

                    nombre_completo:
                        document.getElementById(
                            "personalNombre"
                        ).value.trim(),

                    rango:
                        document.getElementById(
                            "personalRango"
                        ).value.trim(),

                    placa_matricula:
                        document.getElementById(
                            "personalPlaca"
                        ).value.trim(),

                    zona_asignada:
                        document.getElementById(
                            "personalZona"
                        ).value.trim(),

                    estado:
                        document.getElementById(
                            "personalEstado"
                        ).value

                };


                btnGuardar.disabled =
                    true;


                try {

                    const respuesta =
                        await fetch(
                            "../api/personal/crear.php",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        datos
                                    )
                            }
                        );


                    const data =
                        await respuesta.json();


                    if (!data.ok) {

                        throw new Error(
                            data.mensaje
                        );

                    }


                    mensaje.className =
                        "mensaje-formulario visible exito";

                    mensaje.textContent =
                        `Registrado correctamente como ${data.data.id_interno}`;


                    await cargarPersonal();


                    setTimeout(
                        cerrarModal,
                        800
                    );


                } catch (error) {

                    mensaje.className =
                        "mensaje-formulario visible error";

                    mensaje.textContent =
                        error.message;


                } finally {

                    btnGuardar.disabled =
                        false;

                }

            }
        );


        buscar?.addEventListener(
            "input",
            () => {

                clearTimeout(
                    temporizador
                );

                temporizador =
                    setTimeout(
                        cargarPersonal,
                        350
                    );

            }
        );


        filtroCorporacion
            ?.addEventListener(
                "change",
                cargarPersonal
            );


        filtroEstado
            ?.addEventListener(
                "change",
                cargarPersonal
            );


            function obtenerIconoCorporacion(id) {

    switch (Number(id)) {

        case 1:
            return `
                <i class="bi bi-shield-fill"></i>
            `;

        case 2:
            return `
                <i class="bi bi-water"></i>
            `;

        case 3:
            return `
                <i class="bi bi-star-fill"></i>
            `;

        default:
            return `
                <i class="bi bi-shield"></i>
            `;
    }
}


function obtenerClaseCorporacion(id) {

    switch (Number(id)) {

        case 1:
            return "corp-policia";

        case 2:
            return "corp-marina";

        case 3:
            return "corp-gn";

        default:
            return "";
    }
}


function obtenerNombreCorporacion(id) {

    switch (Number(id)) {

        case 1:
            return "Policía";

        case 2:
            return "Marina";

        case 3:
            return "Guardia Nacional";

        default:
            return "Sin corporación";
    }
}


        async function iniciar() {

            const sesion =
                await cargarUsuario();

            if (!sesion) {
                return;
            }

            await cargarCorporaciones();

            await cargarPersonal();

        }


        iniciar();

    }
);