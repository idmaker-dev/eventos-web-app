import React from 'react';

function DynamicFormCrear({ campos, onChangeCampo, onEliminarCampo }) {
  if (!campos) return null;
  return (
    <>
      {campos.map((campo, idx) => (
        <div key={idx} className="crear-cuestionario-campo-dinamico">
          <input
            type="text"
            placeholder="Nombre"
            value={campo.name}
            onChange={(e) => onChangeCampo(idx, 'name', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Etiqueta"
            value={campo.label}
            onChange={(e) => onChangeCampo(idx, 'label', e.target.value)}
            required
          />
          <select
            value={campo.type}
            onChange={(e) => onChangeCampo(idx, 'type', e.target.value)}
          >
            <option value="string">Texto</option>
            <option value="number">Número</option>
            <option value="boolean">Booleano</option>
          </select>
          <select
            value={campo.inputType}
            onChange={(e) => onChangeCampo(idx, 'inputType', e.target.value)}
          >
            <option value="text">Texto</option>
            <option value="number">Número</option>
            <option value="checkbox">Checkbox</option>
            <option value="tel">Teléfono</option>
          </select>
          <input
            type="text"
            placeholder="Placeholder"
            value={campo.placeholder}
            onChange={(e) => onChangeCampo(idx, 'placeholder', e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={campo.required}
              onChange={(e) => onChangeCampo(idx, 'required', e.target.checked)}
            />
            Requerido
          </label>
          <button type="button" onClick={() => onEliminarCampo(idx)} className="eliminar-campo">Eliminar</button>
        </div>
      ))}
    </>
  );
}

export default DynamicFormCrear;
