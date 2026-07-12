// birthDate se guarda como medianoche UTC del día calendario elegido por el
// usuario (sin componente horario real). Formatearlo con la zona horaria
// local del navegador puede restarle un día (p. ej. en UTC-5). Por eso aquí
// siempre leemos/formateamos sus componentes en UTC.

export function formatBirthDate(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Valor listo para un <input type="date">, sin pasar por la zona horaria local. */
export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
