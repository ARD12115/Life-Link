import React from 'react'

export const Skeleton = ({ width, height, borderRadius = '12px', className = '' }) => {
  return (
    <div 
      className={`skeleton-base skeleton-shimmer ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius 
      }}
    />
  )
}

export const CardSkeleton = () => (
  <div className="skeleton-base" style={{ padding: '24px' }}>
    <div className="flex-between" style={{ marginBottom: '15px' }}>
      <div className="skeleton-shimmer" style={{ width: '40%', height: '24px', borderRadius: '20px' }} />
      <div className="skeleton-shimmer" style={{ width: '20%', height: '24px', borderRadius: '20px' }} />
    </div>
    <div className="skeleton-shimmer" style={{ width: '100%', height: '16px', borderRadius: '8px', marginBottom: '8px' }} />
    <div className="skeleton-shimmer" style={{ width: '80%', height: '16px', borderRadius: '8px', marginBottom: '20px' }} />
    <div className="flex-center" style={{ gap: '10px' }}>
      <div className="skeleton-shimmer" style={{ width: '45%', height: '36px', borderRadius: '12px' }} />
      <div className="skeleton-shimmer" style={{ width: '45%', height: '36px', borderRadius: '12px' }} />
    </div>
  </div>
)
