const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    mensajeLogin.textContent = "Validando...";
    mensajeLogin.className = "mensaje";

    try {
        const respuesta = await fetch("../api/auth/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario,
                password: password
            })
        });

        const data = await respuesta.json();

        if (!data.ok) {
            mensajeLogin.textContent = data.mensaje;
            mensajeLogin.className = "mensaje error";
            return;
        }

        mensajeLogin.textContent = "Acceso correcto";
        mensajeLogin.className = "mensaje ok";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 600);

    } catch (error) {
        mensajeLogin.textContent = "Error al conectar con el servidor";
        mensajeLogin.className = "mensaje error";
    }

    
});

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        icon.classList.remove("bi-eye-fill");
        icon.classList.add("bi-eye-slash-fill");

    }else{

        passwordInput.type = "password";

        icon.classList.remove("bi-eye-slash-fill");
        icon.classList.add("bi-eye-fill");

    }

});