<?php
require_once "../../config/session.php";

requiere_login();

responder(true, "Usuario autenticado", [
    "id" => $_SESSION["usuario_id"],
    "usuario" => $_SESSION["usuario"],
    "rol" => $_SESSION["rol"]
]);