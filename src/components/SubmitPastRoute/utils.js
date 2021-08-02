export const formFields = [
  {
    label: 'Start Time',
    id: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'End Time',
    id: 'time_end',
    preReq: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'Select a driver...',
    id: 'driver_name',
    preReq: 'time_end',
    type: 'text',
    suggestionQuery: (name, drivers) =>
      drivers.filter(d => d.name.toLowerCase().startsWith(name.toLowerCase())),
    handleSelect: user => ({
      driver_name: user.name,
      driver_id: user.id,
    }),
  },
]
