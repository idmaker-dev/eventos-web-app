import React from 'react';

/**
 * Renderiza campos dinámicos de un formulario según la definición recibida.
 * @param {Object[]} fields - Lista de campos del formulario.
 * @param {Object} values - Estado actual del formulario.
 * @param {Function} onChange - Función para manejar cambios en los campos.
 */
import '../styles/components/DynamicFormFields.css';

export default function DynamicFormFields({ fields, values, onChange }) {
  return (
    <>
      {fields.map(field => {
        const {
          name, label, type, inputType, required, placeholder, options, min, max, selector
        } = field;
        const value = values[name] || (inputType === 'checkbox' && type !== 'array' ? false : '');

        // Selector personalizado (como la imagen)
        if (selector) {
          // selector: { options: [{label, value}], counts: {value: number}, onAdd, onRemove }
          const { options: selOptions = [], counts = {}, onAdd, onRemove } = selector;
          return (
            <div className="restricciones-block" key={name}>
              {selOptions.map(opt => (
                <div className="restriccion-row" key={opt.value}>
                  <span className="restriccion-label">{opt.label}</span>
                  <div style={{display:'flex', alignItems:'center', gap:4}}>
                    <button
                      type="button"
                      className="restriccion-btn"
                      onClick={() => onRemove(opt.value)}
                      disabled={counts[opt.value] <= 0}
                    >-</button>
                    <span className="restriccion-contador">{counts[opt.value] || 0} personas</span>
                    <button
                      type="button"
                      className={counts[opt.value] > 0 ? 'restriccion-btn selected' : 'restriccion-btn'}
                      onClick={() => onAdd(opt.value)}
                    >+</button>
                  </div>
                </div>
              ))}
              <div style={{marginTop:10}}>
                <label className="restriccion-label" htmlFor={name+"-input"} style={{fontWeight:400}}>Añadir una restricción específica</label>
                <input
                  id={name+"-input"}
                  className="restriccion-input"
                  name={name+"_custom"}
                  type="text"
                  value={value?.custom || ''}
                  onChange={onChange}
                  placeholder="1 persona alergia a la nuez"
                  autoComplete="off"
                  style={{color:'#111'}}
                />
              </div>
            </div>
          );
        }

        // ...estilos unificados para inputs normales...
        if (inputType === 'text' || inputType === 'email' || inputType === 'number') {
          return (
            <label className="cuestionario-label-ico" key={name}>
              {label}
              <input
                name={name}
                type={inputType}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                min={min}
                max={max}
                className="restriccion-input"
                style={{color:'#111'}}
              />
            </label>
          );
        }
        if (inputType === 'textarea') {
          return (
            <label className="cuestionario-label-ico" key={name}>
              {label}
              <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="restriccion-input"
                style={{color:'#111'}}
              />
            </label>
          );
        }
        if (inputType === 'radio' && Array.isArray(options)) {
          return (
            <div className="cuestionario-label-ico" key={name}>
              {label}
              <div className="form-row-opciones">
                {options.map(opt => (
                  <label key={opt.value} className="form-radio-label">
                    <input
                      type="radio"
                      name={name}
                      value={opt.value}
                      checked={value === opt.value}
                      onChange={onChange}
                      required={required}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        if (inputType === 'checkbox' && type === 'array' && Array.isArray(options)) {
          // Checkbox múltiple (array)
          return (
            <div className="cuestionario-label-ico" key={name}>
              {label}
              <div className="form-row-opciones">
                {options.map(opt => (
                  <label key={opt.value} className="form-checkbox-label">
                    <input
                      type="checkbox"
                      name={name}
                      value={opt.value}
                      checked={Array.isArray(value) ? value.includes(opt.value) : false}
                      onChange={onChange}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        if (inputType === 'checkbox' && type === 'boolean') {
          // Checkbox simple (booleano)
          return (
            <label className="cuestionario-label-ico" key={name} style={{flexDirection:'row', alignItems:'center', gap:8}}>
              <input
                type="checkbox"
                name={name}
                checked={!!value}
                onChange={onChange}
                required={required}
                style={{marginRight:8}}
              />
              {label}
            </label>
          );
        }
        // Fallback
        return null;
      })}
    </>
  );
}
