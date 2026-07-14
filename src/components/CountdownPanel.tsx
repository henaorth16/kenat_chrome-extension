import { type FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import {
  distanceToEthiopianDate,
  ethiopianToGregorian,
  toGeez,
} from '../lib/kenat'
import type { CountdownItem } from '../lib/types'
import { calLang, uiLang } from '../lib/types'
import {
  EthiopianDateSelector,
  getDefaultEthiopianDate,
  type EthiopianDateValue,
} from './EthiopianDateSelector'
import './CountdownPanel.css'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function CountdownPanel() {
  const { countdowns, setCountdowns, dict, settings } = useApp()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [ethDate, setEthDate] = useState<EthiopianDateValue>(getDefaultEthiopianDate)
  const [notify, setNotify] = useState(true)
  const chromeAm = uiLang(settings.language) === 'am'
  const contentLang = calLang(settings.language)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const gregorian = ethiopianToGregorian(ethDate)
    const item: CountdownItem = {
      id: uid(),
      title: title.trim(),
      ethiopian: { ...ethDate },
      gregorian,
      notify,
      createdAt: Date.now(),
    }
    void setCountdowns([item, ...countdowns])
    setTitle('')
    setEthDate(getDefaultEthiopianDate())
    setOpen(false)
  }

  const remove = (id: string) => {
    void setCountdowns(countdowns.filter((c) => c.id !== id))
  }

  return (
    <section className="countdown-panel widget-panel panel animate-in">
      <header className="widget-head">
        <div className="panel-header-clean">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className={chromeAm ? 'ethiopic' : ''}>{dict.countdowns}</span>
        </div>
        <button
          type="button"
          className="widget-action-btn"
          onClick={() => {
            setEthDate(getDefaultEthiopianDate())
            setOpen(true)
          }}
        >
          {dict.addCountdown}
        </button>
      </header>

      {open &&
        createPortal(
          <div
            className="widget-add-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <form
              className="widget-add-form panel"
              onSubmit={add}
              role="dialog"
              aria-modal="true"
              aria-label={dict.addCountdown}
            >
              <h3 className={`widget-add-form-title ${chromeAm ? 'ethiopic' : ''}`}>
                {dict.addCountdown}
              </h3>
              <div className="form-fields">
                <input
                  className={`field ${chromeAm ? 'ethiopic' : ''}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={dict.title}
                  required
                  autoFocus
                />
                <EthiopianDateSelector
                  value={ethDate}
                  onChange={setEthDate}
                  ariaLabel={dict.date}
                />
                <label className="notify-row">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                  />
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.notify}</span>
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  {dict.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  {dict.save}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}

      <div className="widget-body">
        {countdowns.length === 0 ? (
          <p className={`widget-empty ${chromeAm ? 'ethiopic' : ''}`}>
            {dict.emptyCountdowns}
          </p>
        ) : (
          <ul className="countdown-list widget-list">
            {countdowns.map((item) => {
              const dist = distanceToEthiopianDate(item.ethiopian, contentLang)
              const dateLabel =
                settings.numeralStyle === 'geez'
                  ? `${toGeez(item.ethiopian.day)}/${toGeez(item.ethiopian.month)}/${toGeez(item.ethiopian.year)}`
                  : `${item.ethiopian.day}/${item.ethiopian.month}/${item.ethiopian.year}`
              return (
                <li key={item.id} className="widget-row countdown-row">
                  <div>
                    <strong className={chromeAm ? 'ethiopic' : ''}>
                      {item.title}
                    </strong>
                    <span className="countdown-date ethiopic">{dateLabel}</span>
                  </div>
                  <div className="countdown-right">
                    <span
                      className={`countdown-eta ${dist.daysUntil < 0 ? 'passed' : ''} ethiopic`}
                    >
                      {dist.label}
                    </span>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => remove(item.id)}
                      aria-label={dict.delete}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
