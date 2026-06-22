<?php
require_once "../../config/session.php";

session_destroy();

responder(true, "Sesión cerrada correctamente");