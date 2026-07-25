// Requerido por los parallel routes: cuando la URL actual no coincide con
// ninguna ruta interceptada (o sea, casi siempre), este slot no debe
// renderizar nada.
export default function Default() {
  return null;
}
