import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleAuthProvider,
} from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "sonner";

const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";
const allowGoogleSignIn =
  process.env.NEXT_PUBLIC_ALLOW_GOOGLE_SIGNIN === "true";

const getFirebaseServices = () => {
  try {
    return {
      auth: getFirebaseAuth(),
      db: getFirebaseDb(),
      provider: getGoogleAuthProvider(),
    };
  } catch (error: any) {
    toast.error(error.message);
    return null;
  }
};

export const signupUserManual = async ({ username, email, password }: any) => {
  if (!allowSignup) {
    toast.error("Private access is enabled. Create users in Firebase Console.");
    return false;
  }

  const isEmailCorrect = /\S+@\S+\.\S+/.test(email);
  if (!username || !email || !password) {
    toast.error("Fill all the fields");
    return false;
  } else {
    if (!isEmailCorrect) {
      toast.error("Cloud: Enter valid Email");
      return false;
    } else {
      const loadingToast = toast.loading("Connecting to cloud provider...");
      try {
        const services = getFirebaseServices();
        if (!services) {
          toast.dismiss(loadingToast);
          return false;
        }
        const userCred = await createUserWithEmailAndPassword(
          services.auth,
          email,
          password,
        );
        const user = userCred.user;
        const colRef = doc(services.db, "users", user.uid);
        await setDoc(colRef, { username: username });
        toast.dismiss(loadingToast);
        toast.success("Cloud: User created! Welcome to Rive club");
        return true;
      } catch (error: any) {
        if (error.message.includes("already-in-use")) {
          toast.dismiss(loadingToast);
          toast.error("Cloud: user is already a Rive member");
        } else {
          console.log({ error });
          toast.dismiss(loadingToast);
          toast.error(`${error.message}`);
          return false;
        }
      }
    }
  }
};

export const loginUserManual = async ({ email, password }: any) => {
  const isEmailCorrect = /\S+@\S+\.\S+/.test(email);

  const loadingToast = toast.loading("Connecting to cloud provider...");
  try {
    const services = getFirebaseServices();
    if (!services) {
      toast.dismiss(loadingToast);
      return false;
    }
    if (!email || !password) {
      toast.dismiss(loadingToast);
      toast.error("Some required fields are empty!");
      return false;
    } else {
      if (!isEmailCorrect) {
        toast.dismiss(loadingToast);
        toast.error("Cloud: Enter valid Email");
        return false;
      } else {
        await signInWithEmailAndPassword(services.auth, email, password);
        toast.dismiss(loadingToast);
        toast.success("Cloud: welcome back");
        return true;
      }
    }
  } catch (error: any) {
    if (error.message.includes("not-found")) {
      toast.dismiss(loadingToast);
      toast.error("Cloud: user not found, ask the site owner for access");
    } else if (error.message.includes("wrong-password")) {
      toast.dismiss(loadingToast);
      toast.error("Cloud: Incorrect password");
    }
    toast.dismiss(loadingToast);
    toast.error(`${error.message}`);
    return false;
  }
};

export const loginUserGoogle = async () => {
  if (!allowGoogleSignIn) {
    toast.error("Google sign-in is disabled for this private deployment.");
    return false;
  }

  const loadingToast = toast.loading("Connecting to cloud provider...");
  try {
    const services = getFirebaseServices();
    if (!services) {
      toast.dismiss(loadingToast);
      return false;
    }
    const result = await signInWithPopup(services.auth, services.provider);
    const user = result?.user;
    toast.dismiss(loadingToast);
    toast.success(`Cloud: welcome ${user.displayName}`);
    return true;
  } catch (error: any) {
    toast.dismiss(loadingToast);
    toast.error(`${error.message}`);
    return false;
  }
};

export const logoutUser = () => {
  const loadingToast = toast.loading("Connecting to cloud provider...");
  const services = getFirebaseServices();
  if (!services) {
    toast.dismiss(loadingToast);
    return;
  }
  signOut(services.auth)
    .then(() => {
      toast.dismiss(loadingToast);
      toast.success("Cloud : Will be missing you!");
    })
    .catch((error) => {
      console.log(error);
      toast.dismiss(loadingToast);
      toast.error(error.message);
    });
};

export const fetchFbWatchlist = async ({ userID = null }: any) => {
  const loadingToast = toast.loading("Connecting to cloud provider...");
  const userWatchlist: any = { movie: [], tv: [] };
  try {
    const services = getFirebaseServices();
    if (!services) {
      toast.dismiss(loadingToast);
      return userWatchlist;
    }
    const q = query(
      collection(services.db, "watchlist"),
      where("userID", "==", userID),
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      userWatchlist[doc.data().type].push(doc.data().id);
    });
    toast.dismiss(loadingToast);
    toast.success("Watchlist fetched successfully");
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error("Error fetching watchlist");
    throw error;
  }

  return userWatchlist;
};

export const removeFromFbWatchlist = async ({
  userID = null,
  type,
  id,
}: any) => {
  const loadingToast = toast.loading("Connecting to cloud provider...");
  try {
    const services = getFirebaseServices();
    if (!services) {
      toast.dismiss(loadingToast);
      return;
    }
    const q = query(
      collection(services.db, "watchlist"),
      where("userID", "==", userID),
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      if (data.type == type && data.id == id) {
        const docRef = doc.ref;
        await deleteDoc(docRef);
      }
    });
    toast.dismiss(loadingToast);
    toast.success("Watchlist updated successfully");
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error("Error updating watchlist");
    throw error;
  }
};

export const checkInFbWatchlist = async ({ userID = null, type, id }: any) => {
  try {
    const services = getFirebaseServices();
    if (!services) {
      return false;
    }
    const q = query(
      collection(services.db, "watchlist"),
      where("userID", "==", userID),
    );
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.type === type && data.id === id) {
        return true;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }
  return false;
};

export const addToFbWatchlist = async ({ userID = null, type, id }: any) => {
  if (userID === null) {
    toast.error("Error updating watchlist");
    return toast.error("Try again");
  } else if (await checkInFbWatchlist({ userID, type, id })) {
    return;
  } else {
    const loadingToast = toast.loading("Connecting to cloud provider...");
    try {
      const services = getFirebaseServices();
      if (!services) {
        toast.dismiss(loadingToast);
        return;
      }
      await addDoc(collection(services.db, "watchlist"), {
        type,
        id,
        userID,
      });
      toast.dismiss(loadingToast);
      toast.success("Watchlist updated successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error updating watchlist");
      throw error;
    }
  }
};
