<?php
require_once "../../config/db.php";
require_once "../../config/session.php";

$input = json_decode(file_get_contents("php://input"), true);

$usuario = trim($input["usuario"] ?? "");
$password = trim($input["password"] ?? "");

if ($usuario === "" || $password === "") {
    responder(false, "Usuario y contraseña son obligatorios");
}

$stmt = $pdo->prepare("
    SELECT 
        u.id,
        u.usuario,
        u.password,
        u.estado,
        r.nombre AS rol
    FROM usuarios u
    INNER JOIN roles r ON r.id = u.rol_id
    WHERE u.usuario = ?
    LIMIT 1
");

$stmt->execute([$usuario]);
$user = $stmt->fetch();

if (!$user) {
    responder(false, "Usuario o contraseña incorrectos");
}

if ($user["estado"] !== "Activo") {
    responder(false, "El usuario no está activo");
}

if (!password_verify($password, $user["password"])) {
    responder(false, "Usuario o contraseña incorrectos");
}

$_SESSION["usuario_id"] = $user["id"];
$_SESSION["usuario"] = $user["usuario"];
$_SESSION["rol"] = $user["rol"];

responder(true, "Inicio de sesión correcto", [
    "id" => $user["id"],
    "usuario" => $user["usuario"],
    "rol" => $user["rol"]
]);