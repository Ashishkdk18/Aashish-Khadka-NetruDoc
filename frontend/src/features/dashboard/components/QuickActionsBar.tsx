import React from 'react'
import { Box, Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export interface QuickAction {
  label: string
  icon?: React.ReactNode
  to?: string
  onClick?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

export interface QuickActionsBarProps {
  actions: QuickAction[]
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ actions }) => {
  const navigate = useNavigate()

  const handleClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick()
      return
    }
    if (action.to) {
      navigate(action.to)
    }
  }

  if (!actions.length) return null

  return (
    <Box
      sx={{
        width: '100%',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1.5,
        px: { xs: 2, md: 4 },
        position: 'sticky',
        top: 64,
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            size="small"
            variant={action.variant || 'outlined'}
            color={action.color || 'primary'}
            startIcon={action.icon}
            onClick={() => handleClick(action)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}

export default QuickActionsBar

