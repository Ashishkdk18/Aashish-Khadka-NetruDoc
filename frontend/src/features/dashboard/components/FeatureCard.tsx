import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardActionArea, CardContent, Box, Typography, Chip } from '@mui/material'

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  to?: string
  statsLabel?: string
  statsValue?: string | number
  actionLabel?: string
  onClick?: () => void
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  to,
  statsLabel,
  statsValue,
  actionLabel,
  onClick,
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (to) {
      navigate(to)
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          height: '100%',
          alignItems: 'stretch',
        }}
      >
        <CardContent
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
            {typeof statsValue !== 'undefined' && (
              <Chip
                label={statsValue}
                size="small"
                color="primary"
                sx={{ fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark' }}
              />
            )}
          </Box>

          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}

          {statsLabel && (
            <Typography variant="caption" color="text.secondary">
              {statsLabel}
            </Typography>
          )}

          {actionLabel && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontWeight: 500,
                color: 'primary.main',
              }}
            >
              {actionLabel} →
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default FeatureCard

