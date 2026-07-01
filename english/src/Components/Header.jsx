import React from 'react'

/**
 * Reusable page header
 * Props: title, subtitle, action (node)
 */
export default function Header({ title, subtitle, action }) {
  return (
    <div className={action ? 'header-row' : 'page-header'}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
