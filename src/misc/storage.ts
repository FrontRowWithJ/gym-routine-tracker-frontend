import { WorkoutDataCache, RoutineData, WorkoutData } from "./types";

const getCache = () => {
  const cache = localStorage.getItem("cache");
  if (cache === null) {
    localStorage.setItem("cache", "{}");
    return {};
  }
  return JSON.parse(cache) as WorkoutDataCache;
};

export const getRoutinesLS = () => {
  const cache = getCache();
  const routines: RoutineData[] = Object.keys(cache).map((routineID) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { workouts, ...rest } = cache[routineID];
    return { ...rest, routineID: +routineID };
  });
  routines.sort((a, b) => a.indexNumber - b.indexNumber);
  return routines;
};

export const setRoutineLS = ({ routineID, ...rest }: RoutineData) => {
  const cache = getCache();
  if (routineID in cache) {
    cache[routineID] = { ...cache[routineID], ...rest };
  } else {
    cache[routineID] = { ...rest, workouts: [] };
  }
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const setRoutinesLS = (routines: RoutineData[]) => {
  const cache = getCache();
  const newCache: WorkoutDataCache = {};
  for (const { routineID, ...rest } of routines) {
    const workouts = cache[routineID]?.workouts ?? [];
    newCache[routineID] = { ...rest, workouts };
  }
  localStorage.setItem("cache", JSON.stringify(newCache));
};

export const setWorkoutLS = (workoutData: WorkoutData) => {
  const cache = getCache();
  const { workouts } = cache[workoutData.routineID];
  const index = workouts.findIndex(
    (workout) => workout.workoutID === workoutData.workoutID
  );
  if (index === -1) {
    cache[workoutData.routineID].workoutCount++;
    workouts.push(workoutData);
  } else workouts[index] = workoutData;
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const setWorkoutsLS = (workouts: WorkoutData[]) => {
  if (workouts.length === 0) return;
  const cache = getCache();
  cache[workouts[0].routineID].workouts = workouts;
  cache[workouts[0].routineID].workoutCount = workouts.length;
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const deleteWorkoutLS = (workoutData: WorkoutData) => {
  const cache = getCache();
  const { workouts } = cache[workoutData.routineID];
  cache[workoutData.routineID].workoutCount--;
  cache[workoutData.routineID].workouts = workouts.filter(
    (workout) => workout.workoutID !== workoutData.workoutID
  );
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const deleteRoutineLS = (routineData: RoutineData) => {
  const cache = getCache();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [routineData.routineID]: toBeDeleted, ...rest } = cache;
  localStorage.setItem("cache", JSON.stringify(rest));
};

export const getWorkoutsLS = (routineID: number): WorkoutData[] => {
  const cache = getCache();
  const workouts = cache[routineID].workouts;
  workouts.sort((a, b) => a.indexNumber - b.indexNumber);
  return workouts;
};

export const initDB = () => {
  const request = window.indexedDB.open("workout-data", 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    const routinesObjectStore = db.createObjectStore("routines", {
      autoIncrement: false,
      keyPath: "routineID",
    });
    routinesObjectStore.createIndex("userID", "userID", {
      unique: false,
      multiEntry: false,
    });
    const workoutsObjectStore = db.createObjectStore("workouts", {
      autoIncrement: false,
      keyPath: "workoutID",
    });
    workoutsObjectStore.createIndex("routineID", "routineID", {
      unique: false,
      multiEntry: false,
    });
  };
};

const openDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open("workout-data", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getRoutineIDB = async (routineID: number) => {
  const db = await openDB();
  return new Promise<RoutineData>((resolve, reject) => {
    const tx = db.transaction("routines", "readonly");
    tx.oncomplete = () => resolve(getRequest.result);
    tx.onerror = () => reject(tx.error);
    const getRequest = tx.objectStore("routines").get(routineID);
  }).finally(() => db.close());
};

const getRecordIDB = async <T extends { indexNumber: number }>(
  id: number,
  storeName: string,
  indexName: string
) => {
  const db = await openDB();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    tx.oncomplete = () => {
      const records: T[] = getAllRequest.result;
      records.sort((a, b) => a.indexNumber - b.indexNumber);
      resolve(records);
    };
    tx.onerror = () => reject(tx.error);
    const getAllRequest = tx.objectStore(storeName).index(indexName).getAll(id);
  }).finally(() => db.close());
};

export const getRoutinesIDB = async (userID: number) =>
  getRecordIDB<RoutineData>(userID, "routines", "userID");

export const getWorkoutsIDB = async (routineID: number) =>
  getRecordIDB<WorkoutData>(routineID, "workouts", "routineID");

export const setRoutinesIDB = async (routines: RoutineData[]) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["routines", "workouts"], "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore("routines").clear().onsuccess = () => {
      const clearWorkoutsRequest = tx.objectStore("workouts").clear();
      clearWorkoutsRequest.onsuccess = () => {
        for (const routine of routines) {
          tx.objectStore("routines").put(routine);
        }
        tx.commit();
      };
    };
  }).finally(() => db.close());
};

export const setWorkoutsIDB = async (workouts: WorkoutData[]) => {
  if (workouts.length === 0) return;
  const db = await openDB();
  const routineID = workouts[0].routineID;
  await deleteWorkoutsIDB(routineID);
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("workouts", "readwrite");
    tx.oncomplete = async () => {
      const routine = await getRoutineIDB(routineID);
      await setRoutineIDB({ ...routine, workoutCount: workouts.length });
      resolve();
    };
    tx.onerror = () => reject(tx.error);
    for (const workout of workouts) tx.objectStore("workouts").put(workout);
  }).finally(() => db.close());
};

const putRecordIDB = async <T>(record: T, storeName: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(storeName).put(record);
  });
};

export const setRoutineIDB = async (routineData: RoutineData) =>
  putRecordIDB(routineData, "routines");

export const putWorkoutIDB = async (workoutData: WorkoutData) =>
  putRecordIDB(workoutData, "workouts");

export const addWorkoutIDB = async (workoutData: WorkoutData) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("workouts", "readwrite");
    tx.oncomplete = async () => {
      const routine = await getRoutineIDB(workoutData.routineID);
      await setRoutineIDB({
        ...routine,
        workoutCount: routine.workoutCount + 1,
      });
      resolve();
    };
    tx.onerror = () => reject(tx.error);
    tx.objectStore("workouts").add(workoutData);
  }).finally(() => db.close());
};

export const deleteRoutinesIDB = async () => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["workouts", "routines"], "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore("workouts").clear();
    tx.objectStore("routines").clear();
  });
};

const deleteWorkoutsIDB = async (routineID: number) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("workouts", "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const deleteCursor = tx
      .objectStore("workouts")
      .index("routineID")
      .openCursor(routineID);
    deleteCursor.onsuccess = () => {
      const cursor = deleteCursor.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }).finally(() => db.close());
};

const deleteRecordIDB = async (
  id: number,
  storeName: string,
  cb: (resolve: (value: void | PromiseLike<void>) => void) => void
) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => cb(resolve);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(storeName).delete(id);
  });
};

export const deleteRoutineIDB = async ({ routineID }: RoutineData) =>
  deleteRecordIDB(routineID, "routines", (resolve) =>
    deleteWorkoutsIDB(routineID).then(resolve)
  );

export const deleteWorkoutIDB = async ({ workoutID, routineID }: WorkoutData) =>
  deleteRecordIDB(workoutID, "workouts", async (resolve) => {
    const routine = await getRoutineIDB(routineID);
    await setRoutineIDB({ ...routine, workoutCount: routine.workoutCount - 1 });
    resolve();
  });
