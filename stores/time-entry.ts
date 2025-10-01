// import { useState, useEffect } from 'react'
// import { toast } from 'sonner'
// import { api } from '@/lib/api'
// import { useAuth } from '@/lib/auth'

// import {
//   TimeEntryFields,
//   FieldName,
//   TimeEntryResponse,
//   TodayTimeEntryResponse,
//   PunchTimeDto,
//   INITIAL_FIELDS_STATE
// } from '@/types/time-entry'

// import { DayMarker } from '@/types/calendar'

// import { 
//   getCurrentTime, 
//   parseTimeToMinutes, 
//   formatMinutesToHours,
//   calculateTimeDifference,
//   formatFusoHorario,
//   getDateISO,
//   formatTimeBR
// } from '@/lib/date-utils'

// import { DEFAULT_ORGANIZATION_ID, API_ROUTES, MESSAGES } from '@/lib/constants'
// import { create } from 'zustand'

// type TimeEntryStore = {
//     month: number,
//     fields: TimeEntryFields,
//     markers: DayMarker[],
//     timeEntries: TimeEntryResponse[],
//     todayEntry: TodayTimeEntryResponse | null,

//     isLoadingEntries: boolean,
//     isLoadingToday: boolean,
//     isSubmitting: Record<FieldName, boolean>
// }

// export const useTimeEntryStore = create<TimeEntryStore>((set) => ({
//   month: new Date().getMonth() + 1,
//   fields: INITIAL_FIELDS_STATE,
//   setFields: (fieldsData: TimeEntryFields) => {
//     set({fields: fieldsData})
//   },

//   markers: [],
//   setMarkers: () => {

//     set((state) => ({

//       markers: state.timeEntries.map(entry => {
    
//         const hasClockIn = !!entry.clockIn;
//         const hasClockOut = !!entry.clockOut;
//         const hasLunchStart = !!entry.lunchStart;
//         const hasLunchEnd = !!entry.lunchEnd;
    
//         let status: 'complete' | 'incomplete' | 'missing' | 'holiday';
    
//         if (!hasClockIn && !hasClockOut && !hasLunchStart && !hasLunchEnd) {
//           status = 'missing';
//         } else if (hasClockIn && hasClockOut && hasLunchStart && hasLunchEnd) {
//           status = 'complete';
//         } else {
//           status = 'incomplete';
//         }
    
//         const dateObj = new Date(entry.date);
//         const dateFusoHorario = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)

//         return {
//           id: entry.id,
//           date: dateFusoHorario,
//           status: status,
//           tooltip: status
//         }
      
//       })

//     }))

//   },

//   timeEntries: [],
//   setTimeEntries: (timeEntriesData: TimeEntryResponse[]) => {
//     set({timeEntries: timeEntriesData})
//   },

//   todayEntry: null,
//   fetchTodayTimeEntry: async () => {
//     try {
//       setIsLoadingToday(true)
//       const entry = await api.get<TodayTimeEntryResponse>(API_ROUTES.TIME_ENTRY.TODAY(user.id), true)
//       setTodayEntry(entry)
      
//       setFields({
//         clockIn: {
//           value: entry.clockIn ? formatTimeBR(entry.clockIn) : null,
//           isJustified: !!entry.clockInJustification,
//           justification: entry.clockInJustification || '',
//           showJustificationForm: false
//         },
//         lunchStart: {
//           value: entry.lunchStart ? formatTimeBR(entry.lunchStart) : null,
//           isJustified: !!entry.lunchStartJustification,
//           justification: entry.lunchStartJustification || '',
//           showJustificationForm: false
//         },
//         lunchEnd: {
//           value: entry.lunchEnd ? formatTimeBR(entry.lunchEnd) : null,
//           isJustified: !!entry.lunchEndJustification,
//           justification: entry.lunchEndJustification || '',
//           showJustificationForm: false
//         },
//         clockOut: {
//           value: entry.clockOut ? formatTimeBR(entry.clockOut) : null,
//           isJustified: !!entry.clockOutJustification,
//           justification: entry.clockOutJustification || '',
//           showJustificationForm: false
//         }
//       })
//     } catch (error: any) {
//       if (error.status !== 404) {
//         toast.error(MESSAGES.ERROR.TODAY_LOAD_ERROR)
//       }
//     } finally {
//       setIsLoadingToday(false)
//     }
//   },

//   isLoadingEntries: false,
//   isLoadingToday: false,
//   isSubmitting: {
//     clockIn: false,
//     lunchStart: false,
//     lunchEnd: false,
//     clockOut: false
//   }
// }))