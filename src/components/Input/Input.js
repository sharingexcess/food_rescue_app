import React, { useState, useEffect } from 'react'
import './Input.scss'

export function Input({
  element_id,
  type,
  label,
  value,
  onChange,
  suggestions = [],
  onSuggestionClick,
  style,
}) {
  const [isUsed, setIsUsed] = useState(false)
  const isDate = () => type === 'datetime-local'

  useEffect(() => {
    setIsUsed(!!value)
  }, [value])

  return (
    <>
      <div className="Input" style={style}>
        <label className={isUsed || isDate() ? 'focused' : ''}>{label}</label>
        {type === 'textarea' ? (
          <textarea
            id={element_id}
            autoComplete="new-password" //prevent autoComplete
            name="no" //prevent autoComplete
            rows={10}
            onChange={onChange}
            value={value}
            onFocus={() => setIsUsed(true)}
            onBlur={e => {
              setIsUsed(e.target.value.length ? true : false)
            }}
          />
        ) : type === 'select' ? (
          <select
            id={element_id}
            value={value}
            onChange={onSuggestionClick}
            onClick={() => setIsUsed(true)}
          >
            <option value={null}></option>
            {suggestions.map(s => (
              <option key={s.id} id={s.id} value={s.id}>
                {s.name} ({s.address1}, {s.city}, {s.state}, {s.zip_code})
              </option>
            ))}
          </select>
        ) : (
          <input
            id={element_id}
            autoComplete="new-password" //prevent autoComplete
            name="no" //prevent autoComplete
            type={type}
            onChange={onChange}
            value={value}
            onFocus={!isDate() ? () => setIsUsed(true) : null}
            onBlur={
              !isDate()
                ? e => {
                    setIsUsed(e.target.value.length ? true : false)
                  }
                : null
            }
          />
        )}
      </div>
      {type === 'text' && suggestions.length ? (
        <ul className="InputSuggestions">
          {suggestions.map(s => (
            <li key={s.id} id={s.id} onClick={e => onSuggestionClick(e, s)}>
              {s.name}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
