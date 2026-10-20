<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

try {

    $stmt = $pdo->query("
        SELECT
            id,
            nombre
        FROM corporaciones
        ORDER BY id ASC
    ");

    $corporaciones = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    responder(
        true,
        "Corporaciones obtenidas correctamente",
        $corporaciones
    );

} catch (PDOException $e) {

    responder(
        false,
        "No fue posible consultar las corporaciones"
    );
}