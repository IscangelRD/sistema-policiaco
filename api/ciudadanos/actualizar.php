<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

if (usuario_actual_rol() !== "Administrador") {
    http_response_code(403);

    responder(
        false,
        "Solamente el administrador puede editar ciudadanos"
    );
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    responder(false, "La información recibida no es válida");
}

$id = filter_var(
    $input["id"] ?? null,
    FILTER_VALIDATE_INT
);

if (!$id) {
    responder(false, "El ciudadano seleccionado no es válido");
}

$nombreCompleto = trim($input["nombre_completo"] ?? "");
$nombreDiscord = trim($input["nombre_discord"] ?? "");
$discordId = trim($input["discord_id"] ?? "");
$fechaNacimiento = trim($input["fecha_nacimiento"] ?? "");
$estado = trim($input["estado"] ?? "");
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

if (!in_array($estado, $estadosPermitidos, true)) {
    responder(false, "El estado seleccionado no es válido");
}

$discordId = $discordId !== ""
    ? $discordId
    : null;

$fechaNacimiento = $fechaNacimiento !== ""
    ? $fechaNacimiento
    : null;

$observaciones = $observaciones !== ""
    ? $observaciones
    : null;

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            id_ciudadano
        FROM ciudadanos
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    $ciudadano = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ciudadano) {
        responder(false, "El ciudadano no existe");
    }

    /*
     * Evitar Discord ID duplicado.
     * Solo se comprueba cuando existe un ID.
     */
    if ($discordId !== null) {

        $verificar = $pdo->prepare("
            SELECT id
            FROM ciudadanos
            WHERE discord_id = ?
            AND id <> ?
            LIMIT 1
        ");

        $verificar->execute([
            $discordId,
            $id
        ]);

        if ($verificar->fetch()) {
            responder(
                false,
                "Ese Discord ID ya pertenece a otro ciudadano"
            );
        }
    }

    $pdo->beginTransaction();

    $actualizar = $pdo->prepare("
        UPDATE ciudadanos
        SET
            nombre_completo = :nombre_completo,
            nombre_discord = :nombre_discord,
            discord_id = :discord_id,
            fecha_nacimiento = :fecha_nacimiento,
            estado = :estado,
            observaciones = :observaciones
        WHERE id = :id
    ");

    $actualizar->execute([
        "nombre_completo" => $nombreCompleto,
        "nombre_discord" => $nombreDiscord,
        "discord_id" => $discordId,
        "fecha_nacimiento" => $fechaNacimiento,
        "estado" => $estado,
        "observaciones" => $observaciones,
        "id" => $id
    ]);

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
            'EDITAR_CIUDADANO',
            'ciudadanos',
            :registro_id,
            :descripcion
        )
    ");

    $historial->execute([
        "usuario_id" => usuario_actual_id(),
        "registro_id" => $id,
        "descripcion" =>
            "Se actualizó el expediente del ciudadano " .
            $ciudadano["id_ciudadano"]
    ]);

    $pdo->commit();

    responder(
        true,
        "Ciudadano actualizado correctamente"
    );

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ((int) $e->getCode() === 23000) {
        responder(
            false,
            "El Discord ID ya está registrado"
        );
    }

    responder(
        false,
        "No fue posible actualizar al ciudadano"
    );
}