import { ESCALA } from './servicioEncuestas';

// Escala de 1 a 5 como grupo de opciones: "grande" para el puntaje general y normal para cada aspecto
export default function SelectorPuntaje({ etiqueta, valor, onCambiar, grande = false, invalido = false }) {
  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      aria-invalid={invalido}
      className={`enc-escala ${grande ? 'enc-escala-grande' : ''} ${invalido ? 'enc-escala-invalida' : ''}`}
    >
      {ESCALA.map((puntaje) => (
        <button
          key={puntaje}
          type="button"
          role="radio"
          aria-checked={valor === puntaje}
          className={`enc-escala-opcion ${valor === puntaje ? 'enc-escala-opcion-activa' : ''}`}
          onClick={() => onCambiar(puntaje)}
        >
          {puntaje}
        </button>
      ))}
    </div>
  );
}
