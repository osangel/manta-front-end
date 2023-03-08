const giantSquidStartTimeStr = 'Wed, 08 Mar 2023 14:33:57 GMT';
const giantSquidEndTimeStr = 'Wed, 08 Mar 2023 16:56:57 GMT';

export const giantSquidTimeDuring = (): boolean => {
  return judgeDuringTime(
    new Date().toUTCString(),
    giantSquidStartTimeStr,
    giantSquidEndTimeStr
  );
};
export const judgeDuringTime = (
  timeStr: string,
  startTimeStr: string,
  endTimeStr: string
): boolean => {
  const targetTimeStamp = new Date(timeStr).getTime();
  const startTimeStamp = new Date(startTimeStr).getTime();
  const endTimeStamp = new Date(endTimeStr).getTime();
  if (targetTimeStamp <= endTimeStamp && targetTimeStamp >= startTimeStamp) {
    return true;
  }
  return false;
};
