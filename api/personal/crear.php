<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

if (usuario_actual_rol() !== "Administrador") {

    http_response_code(403);

    responder(
        false,
        "Solamente el administrador puede registrar personal"
    );
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {

    responder(
        false,
        "La información recibida no es válida"
    );
}

$corporacionId = filter_var(
    $input["corporacion_id"] ?? null,
    FILTER_VALIDATE_INT
);

$nombreCompleto = trim(
    $input["nombre_completo"] ?? ""
);

$placaMatricula = trim(
    $input["placa_matricula"] ?? ""
);

$rango = trim(
    $input["rango"] ?? ""
);

$zonaAsignada = trim(
    $input["zona_asignada"] ?? ""
);

$estado = trim(
    $input["estado"] ?? "Activo"
);

$estadosPermitidos = [
    "Activo",
    "Suspendido",
    "Baja"
];

if (!$corporacionId) {

    responder(
        false,
        "Debes seleccionar una corporación"
    );
}

if ($nombreCompleto === "") {

    responder(
        false,
        "El nombre completo es obligatorio"
    );
}

if (
    !in_array(
        $estado,
        $estadosPermitidos,
        true
    )
) {

    responder(
        false,
        "El estado seleccionado no es válido"
    );
}

try {

    /*
    |--------------------------------------------------------------------------
    | Verificar corporación
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            nombre
        FROM corporaciones
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $corporacionId
    ]);

    $corporacion = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$corporacion) {

        responder(
            false,
            "La corporación seleccionada no existe"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Prefijo
    |--------------------------------------------------------------------------
    */

    switch ($corporacion["nombre"]) {

        case "Policia":
            $prefijo = "POL";
            break;

        case "Marina":
            $prefijo = "MAR";
            break;

        case "Guardia Nacional":
            $prefijo = "GN";
            break;

        default:
            $prefijo = "PER";
            break;
    }


    $pdo->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | ID temporal
    |--------------------------------------------------------------------------
    */

    $idTemporal =
        "TMP-" .
        bin2hex(
            random_bytes(8)
        );


    /*
    |--------------------------------------------------------------------------
    | Insertar
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO personal (
            usuario_id,
            corporacion_id,
            id_interno,
            nombre_completo,
            placa_matricula,
            rango,
            zona_asignada,
            fotografia,
            estado
        )
        VALUES (
            NULL,
            :corporacion_id,
            :id_interno,
            :nombre_completo,
            :placa_matricula,
            :rango,
            :zona_asignada,
            NULL,
            :estado
        )
    ");

    $stmt->execute([

        "corporacion_id" =>
            $corporacionId,

        "id_interno" =>
            $idTemporal,

        "nombre_completo" =>
            $nombreCompleto,

        "placa_matricula" =>
            $placaMatricula !== ""
                ? $placaMatricula
                : null,

        "rango" =>
            $rango !== ""
                ? $rango
                : null,

        "zona_asignada" =>
            $zonaAsignada !== ""
                ? $zonaAsignada
                : null,

        "estado" =>
            $estado
    ]);


    /*
    |--------------------------------------------------------------------------
    | Generar identificador
    |--------------------------------------------------------------------------
    */

    $id =
        (int)
        $pdo->lastInsertId();


    $idInterno =
        $prefijo .
        "-" .
        str_pad(
            (string) $id,
            6,
            "0",
            STR_PAD_LEFT
        );


    $actualizar = $pdo->prepare("
        UPDATE personal
        SET id_interno = ?
        WHERE id = ?
    ");

    $actualizar->execute([
        $idInterno,
        $id
    ]);


    /*
    |--------------------------------------------------------------------------
    | Historial
    |--------------------------------------------------------------------------
    */

    $historial = $pdo->prepare("
        INSERT INTO historial_acciones (
            usuario_id,
            accion,
            tabla_afectada,
            registro_id,
            descripcion
        )
        VALUES (
            :usuario_id,
            'CREAR_PERSONAL',
            'personal',
            :registro_id,
            :descripcion
        )
    ");

    $historial->execute([

        "usuario_id" =>
            usuario_actual_id(),

        "registro_id" =>
            $id,

        "descripcion" =>
            "Se registró al personal {$idInterno}: {$nombreCompleto}"
    ]);


    $pdo->commit();


    responder(
        true,
        "Personal registrado correctamente",
        [
            "id" => $id,
            "id_interno" => $idInterno
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {

        $pdo->rollBack();

    }

    responder(
        false,
        "No fue posible registrar al personal"
    );
}