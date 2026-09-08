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

    $infracciones = [];

    try {

        $stmtInfracciones = $pdo->prepare("
            SELECT *
            FROM infracciones
            WHERE ciudadano_id = ?
            ORDER BY id DESC
        ");

        $stmtInfracciones->execute([$id]);

        $infracciones =
            $stmtInfracciones->fetchAll(
                PDO::FETCH_ASSOC
            );

    } catch (PDOException $e) {

        /*
         * Por ahora no bloqueamos
         * el expediente completo.
         */

        $infracciones = [];

        error_log(
            "Error consultando infracciones: " .
            $e->getMessage()
        );

    }


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