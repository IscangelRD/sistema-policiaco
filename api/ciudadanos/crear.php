<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

if (usuario_actual_rol() !== "Administrador") {
    http_response_code(403);

    responder(
        false,
        "Solamente el administrador puede registrar ciudadanos"
    );
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    responder(false, "La información recibida no es válida");
}

$nombreCompleto = trim($input["nombre_completo"] ?? "");
$nombreDiscord = trim($input["nombre_discord"] ?? "");
$discordId = trim($input["discord_id"] ?? "");
$fechaNacimiento = trim($input["fecha_nacimiento"] ?? "");
$estado = trim($input["estado"] ?? "Activo");
$observaciones = trim($input["observaciones"] ?? "");

$estadosPermitidos = [
    "Activo",
    "Suspendido",
    "Investigado"
];

if ($nombreCompleto === "") {
    responder(false, "El nombre completo es obligatorio");
}

if ($nombreDiscord === "") {
    responder(false, "El usuario de Discord es obligatorio");
}

if (
    $discordId !== "" &&
    !preg_match('/^[0-9]{15,30}$/', $discordId)
) {
    responder(
        false,
        "El Discord ID ingresado no es válido"
    );
}

if ($discordId === "") {
    $discordId = null;
}

if (!in_array($estado, $estadosPermitidos, true)) {
    responder(false, "El estado seleccionado no es válido");
}

if ($fechaNacimiento === "") {
    $fechaNacimiento = null;
}

try {
    $verificar = $pdo->prepare("
        SELECT id
        FROM ciudadanos
        WHERE discord_id = ?
        LIMIT 1
    ");

    $verificar->execute([$discordId]);

    if ($verificar->fetch()) {
        responder(
            false,
            "Ya existe un ciudadano registrado con ese Discord ID"
        );
    }

    $pdo->beginTransaction();

    /*
     * Se utiliza un identificador temporal único porque la columna
     * id_ciudadano es obligatoria. Después del INSERT se genera
     * CIV-000001 con el ID real de MySQL.
     */
    $idTemporal = "TMP-" . bin2hex(random_bytes(8));

    $stmt = $pdo->prepare("
        INSERT INTO ciudadanos (
            usuario_id,
            id_ciudadano,
            nombre_completo,
            nombre_discord,
            discord_id,
            fecha_nacimiento,
            fotografia,
            estado,
            observaciones
        ) VALUES (
            NULL,
            :id_temporal,
            :nombre_completo,
            :nombre_discord,
            :discord_id,
            :fecha_nacimiento,
            NULL,
            :estado,
            :observaciones
        )
    ");

    $stmt->execute([
        "id_temporal" => $idTemporal,
        "nombre_completo" => $nombreCompleto,
        "nombre_discord" => $nombreDiscord,
        "discord_id" => $discordId,
        "fecha_nacimiento" => $fechaNacimiento,
        "estado" => $estado,
        "observaciones" => $observaciones !== ""
            ? $observaciones
            : null
    ]);

    $id = (int) $pdo->lastInsertId();
    $idCiudadano = "CIV-" . str_pad(
        (string) $id,
        6,
        "0",
        STR_PAD_LEFT
    );

    $actualizar = $pdo->prepare("
        UPDATE ciudadanos
        SET id_ciudadano = ?
        WHERE id = ?
    ");

    $actualizar->execute([
        $idCiudadano,
        $id
    ]);

    $historial = $pdo->prepare("
        INSERT INTO historial_acciones (
            usuario_id,
            accion,
            tabla_afectada,
            registro_id,
            descripcion
        ) VALUES (
            :usuario_id,
            'CREAR_CIUDADANO',
            'ciudadanos',
            :registro_id,
            :descripcion
        )
    ");

    $historial->execute([
        "usuario_id" => usuario_actual_id(),
        "registro_id" => $id,
        "descripcion" =>
            "Se registró al ciudadano {$idCiudadano}: {$nombreCompleto}"
    ]);

    $pdo->commit();

    responder(
        true,
        "Ciudadano registrado correctamente",
        [
            "id" => $id,
            "id_ciudadano" => $idCiudadano
        ]
    );

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ((int) $e->getCode() === 23000) {
        responder(
            false,
            "El Discord ID o el ID ciudadano ya está registrado"
        );
    }

    responder(
        false,
        "Ocurrió un error al registrar al ciudadano"
    );

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    responder(
        false,
        "No fue posible completar el registro"
    );
}