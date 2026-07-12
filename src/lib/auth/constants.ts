// Sin otras dependencias a propósito: lo importan tanto código de servidor
// (Node) como el middleware (Edge runtime, no puede cargar Prisma/pg).
export const AUTH_COOKIE_NAME = "jespinoza_token";
