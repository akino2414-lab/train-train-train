import { StationPreset, TrainService } from '../types';

/**
 * Aligns train schedule times relative to the current reference time
 * so the board always displays active, impending trains relative to the user's real-world or simulated time.
 */
export function generateScheduleForTime(
  preset: StationPreset,
  referenceTime: Date
): TrainService[] {
  const currentHours = referenceTime.getHours();
  const currentMinutes = referenceTime.getMinutes();

  // Spacings in minutes from reference time for the upcoming trains
  const minuteOffsets = [3, 10, 18, 28, 42];

  return preset.trains.map((train, index) => {
    const offset = minuteOffsets[index % minuteOffsets.length] + Math.floor(index / minuteOffsets.length) * 45;
    const totalMinutes = currentHours * 60 + currentMinutes + offset;
    const targetHours = Math.floor(totalMinutes / 60) % 24;
    const targetMinutes = totalMinutes % 60;

    const depH = String(targetHours).padStart(2, '0');
    const depM = String(targetMinutes).padStart(2, '0');

    // Arrival is scheduled 3-5 minutes prior to departure
    const arrTotalMinutes = Math.max(0, totalMinutes - 4);
    const arrH = String(Math.floor(arrTotalMinutes / 60) % 24).padStart(2, '0');
    const arrM = String(arrTotalMinutes % 60).padStart(2, '0');

    return {
      ...train,
      scheduledTime: `${depH}:${depM}`,
      arrivalTime: `${arrH}:${arrM}`,
    };
  });
}
