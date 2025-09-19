import React from 'react';

function DynamicFormResponder({ fields, values, onChange }) {
  console.log('DynamicFormResponder fields:', fields);
  console.log('DynamicFormResponder values:', values);
  if (!fields) return null;
  return (
    <>
      {fields.map((field) => {
        if (field.inputType === 'checkbox' && field.type === 'boolean') {
          return (
            <div key={field.name} className="form-group">
              <label>
                <input
                  type="checkbox"
                  name={field.name}
                  checked={!!values[field.name]}
                  onChange={onChange}
                />
                {field.label}
              </label>
            </div>
          );
        }
        if (field.inputType === 'checkbox' && field.type === 'array') {
          return (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.options?.map((opt) => (
                <label key={opt.value} style={{marginLeft: 8}}>
                  <input
                    type="checkbox"
                    name={field.name}
                    value={opt.value}
                    checked={Array.isArray(values[field.name]) && values[field.name].includes(opt.value)}
                    onChange={onChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          );
        }
        if (field.inputType === 'radio') {
          return (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.options?.map((opt) => (
                <label key={opt.value} style={{marginLeft: 8}}>
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={values[field.name] === opt.value}
                    onChange={onChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          );
        }
        // Si tiene options y no es checkbox/radio, mostrar un select
        if (Array.isArray(field.options) && field.options.length > 0 && field.inputType !== 'checkbox' && field.inputType !== 'radio') {
          return (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <select
                name={field.name}
                value={values[field.name] || ''}
                onChange={onChange}
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
            <label>{field.label}</label>
            <input
              type={field.inputType || 'text'}
              name={field.name}
              value={values[field.name] || ''}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
            />
          </div>
        );
      })}
    </>
  );
}

export default DynamicFormResponder;
