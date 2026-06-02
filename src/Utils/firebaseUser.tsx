import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleAuthProvider,
} from "./firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
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
  const isEmailCorrect = /\S+@\S+\.\S+/.test(email);
  if (!username || !email || !password) {
    // toast.dismiss(loadingToast);
    toast.error("Fill all the fields");
    return false;
  } else {
    if (!isEmailCorrect) {
      // toast("Please enter a valid email");
      // toast.dismiss(loadingToast);
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
  // toast.dismiss(loadingToast);
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
      // toast("Fill all fields");
      toast.dismiss(loadingToast);
      toast.error("Some required fields are empty!");
      return false;
    } else {
      if (!isEmailCorrect) {
        // toast("Please enter a valid email");
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
      // toast("user not found, signup first");
      toast.dismiss(loadingToast);
      toast.error("Cloud: user not found, signup first");
    } else if (error.message.includes("wrong-password")) {
      // toast("incorrect password");
      toast.dismiss(loadingToast);
      toast.error("Cloud: Incorrect password");
    }
    // toast("incorrect password");
    toast.dismiss(loadingToast);
    toast.error(`${error.message}`);
    // toast(error.message);
    return false;
  }
};
export const loginUserGoogle = async () => {
  const loadingToast = toast.loading("Connecting to cloud provider...");
  try {
    const services = getFirebaseServices();
    if (!services) {
      toast.dismiss(loadingToast);
      return false;
    }
    const result = await signInWithPopup(services.auth, services.provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
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
      // toast("Now using browser's storage");
      toast.dismiss(loadingToast);
      toast.success("Cloud : Will be missing you!");
    })
    .catch((error) => {
      console.log(error);
      toast.dismiss(loadingToast);
      toast.error(error.message);
    });
};

// export const resetPassword = ({ email }: any) => {
//   if (email) {
//     sendPasswordResetEmail(auth, email, {
//       url: `/login?email=${email}`,
//     })
//       .then(() => {
//         toast("check your email for further process");
//       })
//       .catch((error) => {
//         toast(error.message);
//       });
//   } else {
//     toast("Provide the email associated with the account");
//   }
// };

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
    // Dismiss loading toast and show error toast
    toast.dismiss(loadingToast);
    toast.error("Error fetching watchlist");
    throw error; // Re-throw the error for handling upstream if needed
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
        // id removed
      }
    });
    toast.dismiss(loadingToast);
    toast.success("Watchlist updated successfully");
  } catch (error) {
    // Dismiss loading toast and show error toast
    toast.dismiss(loadingToast);
    toast.error("Error updating watchlist");
    throw error; // Re-throw the error for handling upstream if needed
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
    // toast.dismiss(loadingToast);
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
      const docRef = await addDoc(collection(services.db, "watchlist"), {
        type,
        id,
        userID,
      });
      toast.dismiss(loadingToast);
      toast.success("Watchlist updated successfully");
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToast);
      toast.error("Error updating watchlist");
      throw error; // Re-throw the error for handling upstream if needed
    }
  }
};
