<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

$buscar = trim($_GET["buscar"] ?? "");
$corporacion = trim($_GET["corporacion"] ?? "");
$estado = trim($_GET["estado"] ?? "");

try {

    $sql = "
        SELECT
            p.id,
            p.usuario_id,
            p.corporacion_id,
            p.id_interno,
            p.nombre_completo,
            p.placa_matricula,
            p.rango,
            p.zona_asignada,
            p.fotografia,
            p.estado,
            p.fecha_registro,

            c.nombre AS corporacion

        FROM personal p

        LEFT JOIN corporaciones c
            ON c.id = p.corporacion_id

        WHERE 1 = 1
    ";

    $parametros = [];

    if ($buscar !== "") {

        $sql .= "
            AND (
                p.nombre_completo LIKE :buscar
                OR p.id_interno LIKE :buscar
                OR p.placa_matricula LIKE :buscar
                OR p.rango LIKE :buscar
                OR p.zona_asignada LIKE :buscar
                OR c.nombre LIKE :buscar
            )
        ";

        $parametros["buscar"] =
            "%" . $buscar . "%";
    }

    if ($corporacion !== "") {

        $sql .= "
            AND p.corporacion_id = :corporacion
        ";

        $parametros["corporacion"] =
            (int) $corporacion;
    }

    if ($estado !== "") {

        $sql .= "
            AND p.estado = :estado
        ";

        $parametros["estado"] =
            $estado;
    }

    $sql .= "
        ORDER BY
            c.nombre ASC,
            p.nombre_completo ASC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($parametros);

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