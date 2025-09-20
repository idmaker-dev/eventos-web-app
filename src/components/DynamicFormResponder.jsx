import React from 'react';
import '../styles/components/DynamicFormFields.css';

function DynamicFormResponder({ fields, values, onChange }) {
  if (!fields) return null;

  return (
    <>
      {fields.map(field => {
        const value = values[field.name] || '';

        // Checkbox simple (boolean)
        if (field.inputType === 'checkbox' && field.type === 'boolean') {
          return (
            <div key={field.name} className="form-group">
              <label className="df-label-checkbox">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={!!value}
                  onChange={onChange}
                />
                {field.label}
              </label>
            </div>
          );
        }

        // Checkbox tipo array (selección múltiple)
        if (field.inputType === 'checkbox' && field.type === 'array') {
          return (
            <div key={field.name} className="form-group">
              <label className="df-label">{field.label}</label>
              <div className="df-options">
                {field.options?.map(opt => (
                  <label key={opt.value} className="df-option">
                    <input
                      type="checkbox"
                      name={field.name}
                      value={opt.value}
                      checked={Array.isArray(value) && value.includes(opt.value)}
                      onChange={onChange}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        // Radio
        if (field.inputType === 'radio') {
          return (
            <div key={field.name} className="form-group">
              <label className="df-label">{field.label}</label>
              <div className="df-options">
                {field.options?.map(opt => (
                  <label key={opt.value} className="df-option">
                    <input
                      type="radio"
                      name={field.name}
                      value={opt.value}
                      checked={value === opt.value}
                      onChange={onChange}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        // Select
        if (Array.isArray(field.options) && field.options.length > 0 && field.inputType !== 'checkbox' && field.inputType !== 'radio') {
          return (
            <div key={field.name} className="form-group">
              <label className="df-label">{field.label}</label>
              <select
                name={field.name}
                value={value}
                onChange={onChange}
                className="df-select"
                required={field.required}
              >
                <option value="">Selecciona una opción</option>
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );
        }

        // Input normal
        return (
          <div key={field.name} className="form-group">
            <label className="df-label">{field.label}</label>
            <input
              type={field.inputType || 'text'}
              name={field.name}
              value={value}
              onChange={onChange}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              className="df-input"
            />
          </div>
        );
      })}
    </>
  );
}

export default DynamicFormResponder;
