import React from 'react'

export const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
  return (
    <div 
      className={`skeleton-shimmer ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius 
      }}
    />
  )
}

export const CardSkeleton = () => (
  <div className="card glass skeleton-card">
    <div className="flex-between" style={{ marginBottom: '15px' }}>
      <Skeleton width="40%" height="24px" />
      <Skeleton width="20%" height="24px" borderRadius="20px" />
    </div>
    <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
    <Skeleton width="80%" height="16px" style={{ marginBottom: '20px' }} />
    <div className="flex-center" style={{ gap: '10px' }}>
      <Skeleton width="45%" height="36px" />
      <Skeleton width="45%" height="36px" />
    </div>
  </div>
)
