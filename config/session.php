<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function responder($ok, $mensaje, $data = null) {
    header("Content-Type: application/json; charset=utf-8");

    echo json_encode([
        "ok" => $ok,
        "mensaje" => $mensaje,
        "data" => $data
    ]);

    exit;
}

function requiere_login() {
    if (!isset($_SESSION["usuario_id"])) {
        responder(false, "No has iniciado sesión");
    }
}

function usuario_actual_id() {
    return $_SESSION["usuario_id"] ?? null;
}

function usuario_actual_rol() {
    return $_SESSION["rol"] ?? null;
}