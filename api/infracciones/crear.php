<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

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

$ciudadanoId = filter_var(
    $input["ciudadano_id"] ?? null,
    FILTER_VALIDATE_INT
);

$personalId = filter_var(
    $input["personal_id"] ?? null,
    FILTER_VALIDATE_INT
);

$motivo = trim(
    $input["motivo"] ?? ""
);

$descripcion = trim(
    $input["descripcion"] ?? ""
);

$estado = trim(
    $input["estado"] ?? "Activa"
);

$estadosPermitidos = [
    "Activa",
    "Archivada",
    "Cancelada"
];

if (!$ciudadanoId) {

    responder(
        false,
        "El ciudadano seleccionado no es válido"
    );
}

if (!$personalId) {

    responder(
        false,
        "Debes seleccionar al personal que registra la infracción"
    );
}

if ($motivo === "") {

    responder(
        false,
        "El motivo de la infracción es obligatorio"
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
    | Verificar ciudadano
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            id_ciudadano,
            nombre_completo
        FROM ciudadanos
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $ciudadanoId
    ]);

    $ciudadano = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$ciudadano) {

        responder(
            false,
            "El ciudadano no existe"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Verificar personal
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            nombre_completo
        FROM personal
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $personalId
    ]);

    $personal = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$personal) {

        responder(
            false,
            "El personal seleccionado no existe"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Transacción
    |--------------------------------------------------------------------------
    */

    $pdo->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | Folio temporal
    |--------------------------------------------------------------------------
    */

    $folioTemporal =
        "TMP-" .
        bin2hex(
            random_bytes(8)
        );


    /*
    |--------------------------------------------------------------------------
    | Registrar infracción
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO infracciones (
            folio,
            ciudadano_id,
            personal_id,
            motivo,
            descripcion,
            estado
        )
        VALUES (
            :folio,
            :ciudadano_id,
            :personal_id,
            :motivo,
            :descripcion,
            :estado
        )
    ");

    $stmt->execute([

        "folio" =>
            $folioTemporal,

        "ciudadano_id" =>
            $ciudadanoId,

        "personal_id" =>
            $personalId,

        "motivo" =>
            $motivo,

        "descripcion" =>
            $descripcion !== ""
                ? $descripcion
                : null,

        "estado" =>
            $estado

    ]);


    /*
    |--------------------------------------------------------------------------
    | Generar folio definitivo
    |--------------------------------------------------------------------------
    */

    $id =
        (int)
        $pdo->lastInsertId();

    $folio =
        "INF-" .
        str_pad(
            (string) $id,
            6,
            "0",
            STR_PAD_LEFT
        );


    $actualizar = $pdo->prepare("
        UPDATE infracciones
        SET folio = ?
        WHERE id = ?
    ");

    $actualizar->execute([
        $folio,
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
            'CREAR_INFRACCION',
            'infracciones',
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
            "Se registró la infracción {$folio} al ciudadano " .
            $ciudadano["id_ciudadano"]

    ]);


    $pdo->commit();


    responder(
        true,
        "Infracción registrada correctamente",
        [
            "id" =>
                $id,

            "folio" =>
                $folio
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    responder(
        false,
        "No fue posible registrar la infracción"
    );
}