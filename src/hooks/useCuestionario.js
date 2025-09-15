import { useState } from 'react';

// Genera el estado inicial dinámicamente según los campos
function getInitialState(fields) {
  const state = {};
  fields.forEach(f => {
    if (f.inputType === 'checkbox' && f.type === 'array') {
      state[f.name] = [];
    } else if (f.inputType === 'checkbox' && f.type === 'boolean') {
      state[f.name] = false;
    } else {
      state[f.name] = '';
    }
  });
  return state;
}

export function useCuestionario(fields) {
  const [form, setForm] = useState(() => getInitialState(fields));

  // Maneja cambios para cualquier tipo de campo
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm(prev => {
      // Checkbox múltiple (array)
      const fieldDef = fields.find(f => f.name === name);
      if (fieldDef?.inputType === 'checkbox' && fieldDef?.type === 'array') {
        let arr = Array.isArray(prev[name]) ? [...prev[name]] : [];
        if (checked) {
          if (!arr.includes(value)) arr.push(value);
        } else {
          arr = arr.filter(v => v !== value);
        }
        return { ...prev, [name]: arr };
      }
      // Checkbox simple (booleano)
      if (fieldDef?.inputType === 'checkbox' && fieldDef?.type === 'boolean') {
        return { ...prev, [name]: checked };
      }
      // Radio
      if (fieldDef?.inputType === 'radio') {
        return { ...prev, [name]: value };
      }
      // Otros
      return { ...prev, [name]: value };
    });
  };

  const resetForm = () => setForm(getInitialState(fields));

  return {
    form,
    setForm,
    handleChange,
    resetForm,
  };
}
