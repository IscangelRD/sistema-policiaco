<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

try {

    $stmt = $pdo->query("
        SELECT
            p.id,
            p.nombre_completo,
            c.nombre AS corporacion
        FROM personal p
        LEFT JOIN corporaciones c
            ON c.id = p.corporacion_id
        ORDER BY
            c.nombre ASC,
            p.nombre_completo ASC
    ");

    $personal = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    responder(
        true,
        "Personal obtenido correctamente",
        $personal
    );

} catch (PDOException $e) {

    responder(
        false,
        "No fue posible consultar el personal"
    );
}