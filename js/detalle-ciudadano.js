document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("overlay");

    const btnLogout =
        document.getElementById("btnLogout");


    const nombreUsuario =
        document.getElementById("nombreUsuario");

    const rolUsuario =
        document.getElementById("rolUsuario");


    const pantallaCarga =
        document.getElementById("pantallaCargaCiudadano");

    const contenidoExpediente =
        document.getElementById("contenidoExpediente");


    function abrirMenu() {

        sidebar.classList.add("activo");
        overlay.classList.add("activo");

    }


    function cerrarMenu() {

        sidebar.classList.remove("activo");
        overlay.classList.remove("activo");

    }


    menuBtn?.addEventListener("click", () => {

        if (sidebar.classList.contains("activo")) {

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


    async function cargarUsuario() {

        try {

            const respuesta =
                await fetch("../api/auth/me.php");

            const data =
                await respuesta.json();

            if (!data.ok) {

                window.location.href = "login.html";
                return false;

            }

            nombreUsuario.textContent =
                data.data.usuario;

            rolUsuario.textContent =
                data.data.rol;

            return true;

        } catch {

            window.location.href = "login.html";
            return false;

        }

    }


    function obtenerIdCiudadano() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );

        return parametros.get("id");

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
            return "No registrada";
        }

        const soloFecha =
            String(fecha).substring(0, 10);

        const partes =
            soloFecha.split("-");

        if (partes.length !== 3) {
            return escaparHTML(fecha);
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    function claseEstado(estado) {

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


    function mostrarEstado(estado) {

        return `
            <span
                class="badge-estado ${claseEstado(estado)}"
            >
                <i class="bi bi-circle-fill"></i>

                ${escaparHTML(estado)}
            </span>
        `;

    }


    function renderizarCiudadano(ciudadano) {

        document.title =
            `${ciudadano.id_ciudadano} | Expediente`;


        document.getElementById(
            "tituloCiudadano"
        ).textContent =
            ciudadano.nombre_completo;


        document.getElementById(
            "codigoCiudadano"
        ).textContent =
            `Expediente ${ciudadano.id_ciudadano}`;


        document.getElementById(
            "detalleNombre"
        ).textContent =
            ciudadano.nombre_completo;


        document.getElementById(
            "detalleId"
        ).textContent =
            ciudadano.id_ciudadano;


        document.getElementById(
            "detalleNacimiento"
        ).textContent =
            formatearFecha(
                ciudadano.fecha_nacimiento
            );


        document.getElementById(
            "detalleEstado"
        ).innerHTML =
            mostrarEstado(
                ciudadano.estado
            );


        document.getElementById(
            "detalleDiscordUsuario"
        ).textContent =
            ciudadano.nombre_discord ||
            "No registrado";


        document.getElementById(
            "detalleDiscordId"
        ).textContent =
            ciudadano.discord_id ||
            "No registrado";


        document.getElementById(
            "detalleRegistro"
        ).textContent =
            formatearFecha(
                ciudadano.fecha_registro
            );


        document.getElementById(
            "detalleObservaciones"
        ).textContent =
            ciudadano.observaciones ||
            "Sin observaciones registradas.";


        /* IDENTIFICACIÓN DIGITAL */

        document.getElementById(
            "idNombre"
        ).textContent =
            ciudadano.nombre_completo;


        document.getElementById(
            "idCodigo"
        ).textContent =
            ciudadano.id_ciudadano;


        document.getElementById(
            "idDiscord"
        ).textContent =
            ciudadano.nombre_discord ||
            "No registrado";


        document.getElementById(
            "idEstado"
        ).textContent =
            ciudadano.estado;


        const foto =
            document.getElementById(
                "fotoCiudadano"
            );

        const placeholder =
            document.getElementById(
                "fotoPlaceholder"
            );


        if (ciudadano.fotografia) {

            foto.src =
                `../uploads/ciudadanos/${ciudadano.fotografia}`;

            foto.hidden = false;
            placeholder.hidden = true;

        } else {

            foto.hidden = true;
            placeholder.hidden = false;

        }

    }


    function renderizarInfracciones(infracciones) {

        const lista =
            document.getElementById(
                "listaInfracciones"
            );


        const contador =
            document.getElementById(
                "contadorInfracciones"
            );


        const texto =
            document.getElementById(
                "textoInfracciones"
            );


        const total =
            infracciones.length;


        const activas =
            infracciones.filter(
                item =>
                    item.estado === "Activa"
            ).length;


        const archivadas =
            infracciones.filter(
                item =>
                    item.estado === "Archivada"
            ).length;


        const canceladas =
            infracciones.filter(
                item =>
                    item.estado === "Cancelada"
            ).length;


        contador.textContent = total;


        texto.textContent =
            total === 1
                ? "1 infracción registrada."
                : `${total} infracciones registradas.`;


        document.getElementById(
            "resumenTotalInfracciones"
        ).textContent =
            total;


        document.getElementById(
            "resumenActivas"
        ).textContent =
            activas;


        document.getElementById(
            "resumenArchivadas"
        ).textContent =
            archivadas;


        document.getElementById(
            "resumenCanceladas"
        ).textContent =
            canceladas;


        if (total === 0) {

            lista.innerHTML = `
                <div class="estado-tabla">

                    <i class="bi bi-shield-check"></i>

                    <span>
                        El ciudadano no tiene infracciones registradas.
                    </span>

                </div>
            `;

            return;

        }


        lista.innerHTML =
            infracciones.map(
                infraccion => `

                    <article class="infraccion-item">

                        <div class="infraccion-folio">

                            <span>
                                Folio
                            </span>

                            <strong>
                                ${escaparHTML(
                                    infraccion.folio
                                )}
                            </strong>

                        </div>


                        <div class="infraccion-contenido">

                            <span>
                                Motivo
                            </span>

                            <strong>
                                ${escaparHTML(
                                    infraccion.motivo
                                )}
                            </strong>

                            <p>
                                ${escaparHTML(
                                    infraccion.descripcion ||
                                    "Sin descripción."
                                )}
                            </p>

                            ${mostrarEstadoInfraccion(
                                infraccion.estado
                            )}

                        </div>


                        <div class="infraccion-fecha">

                            <span>
                                Fecha
                            </span>

                            <strong>
                                ${formatearFecha(
                                    infraccion.fecha
                                )}
                            </strong>

                        </div>

                    </article>

                `
            ).join("");

    }


    function mostrarEstadoInfraccion(estado) {

        let clase = "badge-investigado";

        if (estado === "Activa") {
            clase = "badge-suspendido";
        }

        if (estado === "Archivada") {
            clase = "badge-activo";
        }

        return `
            <span
                class="badge-estado ${clase}"
                style="margin-top:8px"
            >
                ${escaparHTML(estado)}
            </span>
        `;

    }


    function mostrarError(mensaje) {

        pantallaCarga.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:25px;
                "
            >

                <i
                    class="bi bi-exclamation-triangle-fill"
                    style="
                        font-size:35px;
                        color:#f87171;
                    "
                ></i>

                <p
                    style="
                        margin-top:15px;
                        color:#cbd5e1;
                    "
                >

                    ${escaparHTML(mensaje)}

                </p>


                <a
                    href="ciudadanos.html"
                    class="btn-principal btn-auto"
                    style="
                        margin-top:20px;
                        text-decoration:none;
                    "
                >

                    <i class="bi bi-arrow-left"></i>

                    Volver

                </a>

            </div>
        `;

    }


    async function cargarExpediente() {

        const id =
            obtenerIdCiudadano();


        if (!id || !/^\d+$/.test(id)) {

            mostrarError(
                "No se recibió un ciudadano válido."
            );

            return;

        }


        try {

            const respuesta =
                await fetch(
                    `../api/ciudadanos/ver.php?id=${encodeURIComponent(id)}`
                );


            const data =
                await respuesta.json();


            if (!data.ok) {

                throw new Error(
                    data.mensaje ||
                    "No fue posible cargar el expediente"
                );

            }


            renderizarCiudadano(
                data.data.ciudadano
            );


            renderizarInfracciones(
                data.data.infracciones || []
            );


            pantallaCarga.hidden = true;

            contenidoExpediente.hidden = false;


        } catch (error) {

            mostrarError(
                error.message
            );

        }

    }


    async function iniciar() {

        const sesion =
            await cargarUsuario();


        if (!sesion) {
            return;
        }


        await cargarExpediente();

    }


    iniciar();

});