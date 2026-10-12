<?php

require_once "../../config/db.php";
require_once "../../config/session.php";

requiere_login();

header("Content-Type: application/json; charset=utf-8");

if (usuario_actual_rol() !== "Administrador") {
    http_response_code(403);

    responder(
        false,
        "Solamente el administrador puede cambiar esta fotografía"
    );
}

$id = filter_input(
    INPUT_POST,
    "id",
    FILTER_VALIDATE_INT
);

if (!$id) {
    responder(
        false,
        "El ciudadano seleccionado no es válido"
    );
}

if (
    !isset($_FILES["fotografia"]) ||
    $_FILES["fotografia"]["error"] !== UPLOAD_ERR_OK
) {
    responder(
        false,
        "No se recibió una fotografía válida"
    );
}

$archivo = $_FILES["fotografia"];

/*
|--------------------------------------------------------------------------
| Tamaño máximo: 5 MB
|--------------------------------------------------------------------------
*/

$tamanoMaximo = 5 * 1024 * 1024;

if ($archivo["size"] > $tamanoMaximo) {
    responder(
        false,
        "La fotografía no puede superar los 5 MB"
    );
}

/*
|--------------------------------------------------------------------------
| Verificamos MIME real
|--------------------------------------------------------------------------
*/

$finfo = new finfo(FILEINFO_MIME_TYPE);

$mime = $finfo->file(
    $archivo["tmp_name"]
);

$tiposPermitidos = [
    "image/jpeg" => "jpg",
    "image/png"  => "png",
    "image/webp" => "webp"
];

if (!isset($tiposPermitidos[$mime])) {
    responder(
        false,
        "Solo se permiten imágenes JPG, PNG o WEBP"
    );
}

try {

    /*
    |--------------------------------------------------------------------------
    | Consultar ciudadano
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            id_ciudadano,
            fotografia
        FROM ciudadanos
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

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
    | Generar nombre único
    |--------------------------------------------------------------------------
    */

    $extension =
        $tiposPermitidos[$mime];

    $nombreArchivo =
        "ciudadano_" .
        $id .
        "_" .
        bin2hex(random_bytes(8)) .
        "." .
        $extension;

    $directorio =
        "../../uploads/ciudadanos/";

    if (!is_dir($directorio)) {

        if (
            !mkdir(
                $directorio,
                0755,
                true
            )
        ) {
            responder(
                false,
                "No fue posible crear la carpeta de fotografías"
            );
        }

    }

    $rutaDestino =
        $directorio .
        $nombreArchivo;

    /*
    |--------------------------------------------------------------------------
    | Guardar archivo
    |--------------------------------------------------------------------------
    */

    if (
        !move_uploaded_file(
            $archivo["tmp_name"],
            $rutaDestino
        )
    ) {
        responder(
            false,
            "No fue posible guardar la fotografía"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar base de datos
    |--------------------------------------------------------------------------
    */

    $actualizar = $pdo->prepare("
        UPDATE ciudadanos
        SET fotografia = ?
        WHERE id = ?
    ");

    $actualizar->execute([
        $nombreArchivo,
        $id
    ]);

    /*
    |--------------------------------------------------------------------------
    | Borrar fotografía anterior
    |--------------------------------------------------------------------------
    */

    if (
        !empty($ciudadano["fotografia"]) &&
        $ciudadano["fotografia"] !== $nombreArchivo
    ) {

        $fotoAnterior =
            $directorio .
            basename(
                $ciudadano["fotografia"]
            );

        if (is_file($fotoAnterior)) {
            @unlink($fotoAnterior);
        }

    }

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
            'ACTUALIZAR_FOTO',
            'ciudadanos',
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
            "Se actualizó la fotografía del ciudadano " .
            $ciudadano["id_ciudadano"]
    ]);

    responder(
        true,
        "Fotografía actualizada correctamente",
        [
            "fotografia" => $nombreArchivo
        ]
    );

} catch (Throwable $e) {

    responder(
        false,
        "No fue posible actualizar la fotografía"
    );

}