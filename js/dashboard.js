document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const btnLogout = document.getElementById("btnLogout");

    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("activo");
            overlay.classList.toggle("activo");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("activo");
            overlay.classList.remove("activo");
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            await fetch("../api/auth/logout.php");
            window.location.href = "login.html";
        });
    }

    async function cargarUsuario(){
    try{
        const res = await fetch("../api/auth/me.php");
        const data = await res.json();

        if(!data.ok){
            window.location.href = "login.html";
            return;
        }

        document.getElementById("nombreUsuario").textContent = data.data.usuario;
        document.getElementById("rolUsuario").textContent = data.data.rol;

    }catch(error){
        window.location.href = "login.html";
    }
}

cargarUsuario();
});