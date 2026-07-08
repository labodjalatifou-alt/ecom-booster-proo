'use client'

import React from 'react'

export default function SpacerRender({ settings = {} }: { settings?: any }) {
  const height = settings.height || 48
  const bgColor = settings.bg_color || 'transparent'
  const pattern = settings.pattern || 'none'
  const showDivider = settings.show_divider
  const dividerStyle = settings.divider_style || 'line'

  return (
    <div 
      className="landing-spacer-render" 
      style={{ 
        height, 
        backgroundColor: bgColor,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {pattern === 'wave' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.5 }}>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path fill="rgba(245, 158, 11, 0.4)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      )}
      
      {showDivider && (
        <div 
          style={{ 
            width: '100%', 
            maxWidth: 1200, 
            borderTop: dividerStyle === 'line' ? '1px solid #e5e7eb' : 
                       dividerStyle === 'dashed' ? '1px dashed #e5e7eb' : 
                       '1px dotted #e5e7eb',
            position: 'relative',
            zIndex: 1
          }} 
        />
      )}
    </div>
  )
}
