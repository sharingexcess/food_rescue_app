import React, { useState, useEffect } from 'react'

export function Input({
  element_id,
  type,
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  style,
  readOnly,
  inherited_ref,
  animation = true,
}) {
  const [isUsed, setIsUsed] = useState(type === 'select' ? true : false)
  const shouldNotMoveLabel = () =>
    ['time', 'datetime-local', 'select'].includes(type)

  useEffect(() => {
    setIsUsed(!!value)
  }, [value])

  return (
    <>
      <div
        className={`Input ${animation ? 'animation' : ''} ${type}`}
        style={style}
      >
        <label className={isUsed || shouldNotMoveLabel() ? 'focused' : ''}>
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={element_id}
            autoComplete="new-password" //prevent autoComplete
            name="no" //prevent autoComplete
            rows={3}
            wrap="hard"
            onChange={onChange}
            value={value}
            onFocus={() => setIsUsed(true)}
            onBlur={e => {
              setIsUsed(e.target.value.length ? true : false)
            }}
            readOnly={readOnly}
            disabled={readOnly}
          />
        ) : type === 'select' ? (
          <select
            id={element_id}
            value={value}
            onChange={onSuggestionClick}
            onClick={() => setIsUsed(true)}
            readOnly={readOnly}
            disabled={readOnly}
          >
            <option value={null}></option>
            {suggestions
              ? suggestions.map(s => (
                  <option key={s.id || s} id={s.id || s} value={s.id || s}>
                    {s.address1
                      ? `${s.name} (${s.address1}, ${s.city}, ${s.state}, ${s.zip_code})`
                      : s}
                  </option>
                ))
              : null}
          </select>
        ) : (
          <input
            id={element_id}
            autoComplete="off" //prevent autoComplete
            name="no" //prevent autoComplete
            type={type}
            ref={inherited_ref}
            onChange={onChange}
            readOnly={readOnly}
            disabled={readOnly}
            placeholder=""
            value={value}
            onFocus={!shouldNotMoveLabel() ? () => setIsUsed(true) : null}
            onBlur={
              !shouldNotMoveLabel()
                ? e => {
                    setIsUsed(e.target.value.length ? true : false)
                  }
                : null
            }
          />
        )}
      </div>
      {type === 'text' && suggestions ? (
        <ul className="InputSuggestions">
          {suggestions.length && value.length ? (
            suggestions.map(s => (
              <li key={s.id} id={s.id} onClick={e => onSuggestionClick(e, s)}>
                {s.name}
                {s.email ? ` (${s.email})` : ''}
              </li>
            ))
          ) : value.length ? (
            <li style={{ pointerEvents: 'none' }}>
              No results, try a different prefix!
            </li>
          ) : null}
        </ul>
      ) : null}
    </>
  )
}
