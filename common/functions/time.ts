import { Habit } from '@prisma/client'
import moment from 'moment-timezone'

export function habitAbleToBeClaimed(habit: Habit, timeZone: string) {
    // if the habit's streakContinuedAt is null it's
    // never been claimed so it can be claimed
    if (habit.streakContinuedAt == null) {
        return true
    }

    // if the habit was last claimed yesterday in the user's time zone,
    // it can be claimed again now

    // get the current date in the user's given time zone
    var currentDateInUserTimeZone = moment().tz(timeZone)

    // get the habit's streak continued at date in the given timezone
    var habitLastContinuedDateInUserTimeZone = moment(habit.streakContinuedAt).tz(timeZone)

    // check if the habit was last claimed yesterday (or before) in the
    // given timezone
    if (habitLastContinuedDateInUserTimeZone.isBefore(currentDateInUserTimeZone, 'date')) {
        // if it was, the habit is now able to be claimed again by the user
        return true
    }

    return false
}
