document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const btnLogout = document.getElementById("btnLogout");

    const nombreUsuario = document.getElementById("nombreUsuario");
    const rolUsuario = document.getElementById("rolUsuario");

    const inputBuscar = document.getElementById("inputBuscar");
    const btnLimpiarBusqueda = document.getElementById(
        "btnLimpiarBusqueda"
    );
    const btnRecargar = document.getElementById("btnRecargar");

    const btnNuevoCiudadano = document.getElementById(
        "btnNuevoCiudadano"
    );

    const modalCiudadano = document.getElementById(
        "modalCiudadano"
    );

    const formCiudadano = document.getElementById(
        "formCiudadano"
    );

    const btnGuardarCiudadano = document.getElementById(
        "btnGuardarCiudadano"
    );

    const mensajeCiudadano = document.getElementById(
        "mensajeCiudadano"
    );

    const tablaCiudadanos = document.getElementById(
        "tablaCiudadanos"
    );

    const textoResultados = document.getElementById(
        "textoResultados"
    );

    const totalCiudadanosLista = document.getElementById(
        "totalCiudadanosLista"
    );

    const totalActivos = document.getElementById(
        "totalActivos"
    );

    const totalOtros = document.getElementById(
        "totalOtros"
    );

    let temporizadorBusqueda = null;
    let rolActual = null;

    function abrirMenu() {
        sidebar.classList.add("activo");
        overlay.classList.add("activo");
    }

    function cerrarMenu() {
        sidebar.classList.remove("activo");
        overlay.classList.remove("activo");
    }

    menuBtn?.addEventListener("click", () => {
        const estaAbierto = sidebar.classList.contains("activo");

        if (estaAbierto) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    overlay?.addEventListener("click", cerrarMenu);

    btnLogout?.addEventListener("click", async () => {
        try {
            await fetch("../api/auth/logout.php");
        } finally {
            window.location.href = "login.html";
        }
    });

    function abrirModal() {
        formCiudadano.reset();

        document.getElementById("estadoCiudadano").value = "Activo";

        limpiarMensaje();

        modalCiudadano.classList.add("activo");
        document.body.classList.add("modal-abierto");

        setTimeout(() => {
            document.getElementById("nombreCompleto").focus();
        }, 100);
    }

    function cerrarModal() {
        modalCiudadano.classList.remove("activo");
        document.body.classList.remove("modal-abierto");
        limpiarMensaje();
    }

    document.querySelectorAll("[data-cerrar-modal]").forEach(
        elemento => {
            elemento.addEventListener("click", cerrarModal);
        }
    );

    document.addEventListener("keydown", evento => {
        if (
            evento.key === "Escape" &&
            modalCiudadano.classList.contains("activo")
        ) {
            cerrarModal();
        }
    });

    btnNuevoCiudadano?.addEventListener("click", () => {
        if (rolActual !== "Administrador") {
            alert(
                "Solamente el administrador puede registrar ciudadanos."
            );
            return;
        }

        abrirModal();
    });

    async function cargarUsuario() {
        try {
            const respuesta = await fetch("../api/auth/me.php");
            const data = await respuesta.json();

            if (!data.ok) {
                window.location.href = "login.html";
                return false;
            }

            nombreUsuario.textContent = data.data.usuario;
            rolUsuario.textContent = data.data.rol;

            rolActual = data.data.rol;

            if (rolActual !== "Administrador") {
                btnNuevoCiudadano.style.display = "none";
            }

            return true;

        } catch (error) {
            window.location.href = "login.html";
            return false;
        }
    }

    function escaparHTML(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatearFecha(fecha) {
        if (!fecha) {
            return "Sin fecha";
        }

        const partes = fecha
            .substring(0, 10)
            .split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case "Activo":
                return "badge-activo";

            case "Suspendido":
                return "badge-suspendido";

            case "Investigado":
                return "badge-investigado";

            default:
                return "";
        }
    }

    function renderizarCiudadanos(ciudadanos) {
        if (!Array.isArray(ciudadanos) || ciudadanos.length === 0) {
            tablaCiudadanos.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="estado-tabla">
                            <i class="bi bi-person-x-fill"></i>
                            <span>No se encontraron ciudadanos.</span>
                        </div>
                    </td>
                </tr>
            `;

            textoResultados.textContent = "Sin resultados";
            actualizarResumen([]);
            return;
        }

        tablaCiudadanos.innerHTML = ciudadanos
            .map(ciudadano => {

                const foto = ciudadano.fotografia
                    ? `
                        <img
                            src="../uploads/ciudadanos/${escaparHTML(
                        ciudadano.fotografia
                    )}"
                            alt="Fotografía"
                        >
                    `
                    : `<i class="bi bi-person-fill"></i>`;

                return `
                    <tr>
                        <td>
                            <div class="ciudadano-identidad">

                                <div class="ciudadano-avatar">
                                    ${foto}
                                </div>

                                <div>
                                    <strong>
                                        ${escaparHTML(
                    ciudadano.nombre_completo
                )}
                                    </strong>

                                    <span>
                                        ${ciudadano.fecha_nacimiento
                        ? `Nacimiento RP: ${formatearFecha(
                            ciudadano.fecha_nacimiento
                        )
                        }`
                        : "Nacimiento RP no registrado"
                    }
                                    </span>
                                </div>

                            </div>
                        </td>

                        <td>
                            <span class="codigo-id">
                                ${escaparHTML(
                        ciudadano.id_ciudadano
                    )}
                            </span>
                        </td>

                        <td>
                            <div class="discord-box">
                                <i class="bi bi-discord"></i>

                                <div>
                                    <span>
                                        ${escaparHTML(
                        ciudadano.nombre_discord
                    )}
                                    </span>

                                    <small>
                                        ${escaparHTML(
                        ciudadano.discord_id
                    )}
                                    </small>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span
                                class="badge-estado ${obtenerClaseEstado(
                        ciudadano.estado
                    )
                    }"
                            >
                                <i class="bi bi-circle-fill"></i>
                                ${escaparHTML(ciudadano.estado)}
                            </span>
                        </td>

                        <td>
                            ${formatearFecha(
                        ciudadano.fecha_registro
                    )}
                        </td>

                        <td>
                            <div class="acciones-tabla">

                                <button
                                    type="button"
                                    class="btn-tabla"
                                    title="Ver ciudadano"
                                    data-accion="ver"
                                    data-id="${ciudadano.id}"
                                >
                                    <i class="bi bi-eye-fill"></i>
                                </button>

                            </div>
                        </td>
                    </tr>
                `;
            })
            .join("");

        textoResultados.textContent =
            `${ciudadanos.length} ciudadano(s) encontrado(s)`;

        actualizarResumen(ciudadanos);
    }

    function actualizarResumen(ciudadanos) {
        const total = ciudadanos.length;

        const activos = ciudadanos.filter(
            ciudadano => ciudadano.estado === "Activo"
        ).length;

        totalCiudadanosLista.textContent = total;
        totalActivos.textContent = activos;
        totalOtros.textContent = total - activos;
    }

    async function cargarCiudadanos(busqueda = "") {
        tablaCiudadanos.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="estado-tabla">
                        <div class="spinner"></div>
                        <span>Cargando ciudadanos...</span>
                    </div>
                </td>
            </tr>
        `;

        try {
            const url = new URL(
                "../api/ciudadanos/listar.php",
                window.location.href
            );

            if (busqueda.trim() !== "") {
                url.searchParams.set(
                    "buscar",
                    busqueda.trim()
                );
            }

            const respuesta = await fetch(url);
            const data = await respuesta.json();

            if (!data.ok) {
                throw new Error(
                    data.mensaje ||
                    "No fue posible cargar los ciudadanos"
                );
            }

            renderizarCiudadanos(data.data ?? []);

        } catch (error) {
            tablaCiudadanos.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="estado-tabla">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <span>
                                ${escaparHTML(error.message)}
                            </span>
                        </div>
                    </td>
                </tr>
            `;

            textoResultados.textContent =
                "Error al cargar los registros";
        }
    }

    inputBuscar?.addEventListener("input", () => {
        clearTimeout(temporizadorBusqueda);

        temporizadorBusqueda = setTimeout(() => {
            cargarCiudadanos(inputBuscar.value);
        }, 350);
    });

    btnLimpiarBusqueda?.addEventListener("click", () => {
        inputBuscar.value = "";
        inputBuscar.focus();
        cargarCiudadanos();
    });

    btnRecargar?.addEventListener("click", () => {
        cargarCiudadanos(inputBuscar.value);
    });

    function mostrarMensaje(tipo, texto) {
        mensajeCiudadano.className =
            `mensaje-formulario visible ${tipo}`;

        mensajeCiudadano.textContent = texto;
    }

    function limpiarMensaje() {
        mensajeCiudadano.className = "mensaje-formulario";
        mensajeCiudadano.textContent = "";
    }

    formCiudadano?.addEventListener("submit", async evento => {
        evento.preventDefault();
        limpiarMensaje();

        const datos = {
            nombre_completo:
                document.getElementById("nombreCompleto")
                    .value.trim(),

            nombre_discord:
                document.getElementById("nombreDiscord")
                    .value.trim(),

            discord_id:
                document.getElementById("discordId")
                    .value.trim(),

            fecha_nacimiento:
                document.getElementById("fechaNacimiento")
                    .value,

            estado:
                document.getElementById("estadoCiudadano")
                    .value,

            observaciones:
                document.getElementById("observaciones")
                    .value.trim()
        };

        if (
            datos.discord_id !== "" &&
            !/^[0-9]{15,30}$/.test(datos.discord_id)
        ) {
            mostrarMensaje(
                "error",
                "Si ingresas un Discord ID, debe ser un identificador numérico válido."
            );

            return;
        }

        btnGuardarCiudadano.disabled = true;
        btnGuardarCiudadano.innerHTML = `
            <span class="spinner"></span>
            Guardando...
        `;

        try {
            const respuesta = await fetch(
                "../api/ciudadanos/crear.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datos)
                }
            );

            const data = await respuesta.json();

            if (!data.ok) {
                throw new Error(
                    data.mensaje ||
                    "No fue posible registrar al ciudadano"
                );
            }

            mostrarMensaje(
                "exito",
                `Ciudadano registrado con el ID ${data.data.id_ciudadano
                }.`
            );

            await cargarCiudadanos();

            setTimeout(() => {
                cerrarModal();
            }, 900);

        } catch (error) {
            mostrarMensaje("error", error.message);

        } finally {
            btnGuardarCiudadano.disabled = false;

            btnGuardarCiudadano.innerHTML = `
                <i class="bi bi-floppy-fill"></i>
                Guardar ciudadano
            `;
        }
    });

    tablaCiudadanos?.addEventListener("click", evento => {

        const boton = evento.target.closest(
            "[data-accion='ver']"
        );

        if (!boton) {
            return;
        }

        const id = boton.dataset.id;

        window.location.href =
            `detalle-ciudadano.html?id=${encodeURIComponent(id)}`;

    });

    async function iniciarPagina() {
        const sesionValida = await cargarUsuario();

        if (sesionValida) {
            await cargarCiudadanos();
        }
    }

    iniciarPagina();
});