<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

if (!$id) {
    responder(
        false,
        "El ciudadano solicitado no es válido"
    );
}

try {

    /*
     * ===============================
     * CIUDADANO
     * ===============================
     */

    $stmt = $pdo->prepare("
        SELECT
            id,
            usuario_id,
            id_ciudadano,
            nombre_completo,
            nombre_discord,
            discord_id,
            fecha_nacimiento,
            fotografia,
            estado,
            observaciones,
            fecha_registro
        FROM ciudadanos
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    $ciudadano = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ciudadano) {

        responder(
            false,
            "El ciudadano no fue encontrado"
        );
    }


    /*
     * ===============================
     * INFRACCIONES
     * ===============================
     */

    $stmtInfracciones = $pdo->prepare("
    SELECT
        i.id,
        i.folio,
        i.motivo,
        i.descripcion,
        i.estado,
       i.fecha_registro AS fecha,

        p.nombre_completo AS personal_nombre,

        c.nombre AS corporacion

    FROM infracciones i

    LEFT JOIN personal p
        ON p.id = i.personal_id

    LEFT JOIN corporaciones c
        ON c.id = p.corporacion_id

    WHERE i.ciudadano_id = ?

    ORDER BY i.id DESC
");

    $stmtInfracciones->execute([
        $id
    ]);

    $infracciones =
        $stmtInfracciones->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
     * ===============================
     * RESPUESTA
     * ===============================
     */

    responder(
        true,
        "Expediente obtenido correctamente",
        [
            "ciudadano" => $ciudadano,
            "infracciones" => $infracciones
        ]
    );
} catch (PDOException $e) {

    responder(
        false,
        "ERROR SQL: " . $e->getMessage()
    );
}
