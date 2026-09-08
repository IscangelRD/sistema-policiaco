<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

try {
    $buscar = trim($_GET["buscar"] ?? "");

    $sql = "
        SELECT
            id,
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
    ";

    $parametros = [];

    if ($buscar !== "") {
        $sql .= "
            WHERE
                id_ciudadano LIKE :buscar
                OR nombre_completo LIKE :buscar
                OR nombre_discord LIKE :buscar
                OR discord_id LIKE :buscar
        ";

        $parametros["buscar"] = "%" . $buscar . "%";
    }

    $sql .= " ORDER BY id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);

    $ciudadanos = $stmt->fetchAll();

    responder(
        true,
        "Ciudadanos obtenidos correctamente",
        $ciudadanos
    );

} catch (PDOException $e) {
    responder(
        false,
        "No fue posible consultar los ciudadanos",
        null
    );
}