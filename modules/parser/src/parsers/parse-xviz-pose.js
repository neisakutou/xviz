export function parseXVIZPose(pose) {
  const {mapOrigin, position, orientation, timestamp} = pose;

  const result = {
    timestamp
  };

  if (mapOrigin) {
    const {longitude, latitude, altitude} = mapOrigin;
    Object.assign(result, {
      longitude,
      latitude,
      altitude
    });
  } else {
    Object.assign(result, {
      longitude: -79.9475834,
      latitude: 40.4090922,
      altitude: 264
    });
  }

  if (position) {
    const [x, y, z] = position;
    Object.assign(result, {
      x,
      y,
      z
    });
  }

  if (orientation) {
    const [roll, pitch, yaw] = orientation;
    Object.assign(result, {
      roll,
      pitch,
      yaw
    });
  }

  return {...pose, ...result};
}
