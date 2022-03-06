// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getRedirectResult,
  signInWithRedirect,
  onAuthStateChanged,
} from "firebase/auth";
import {
  get,
  set,
  getDatabase,
  child,
  ref,
  onValue,
  query,
  limitToLast,
  push,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-qaVx6w8ko-HENXWfKe6_g4lIW7Fsv4Q",
  authDomain: "my-chat-topic.firebaseapp.com",
  databaseURL:
    "https://my-chat-topic-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-chat-topic",
  storageBucket: "my-chat-topic.appspot.com",
  messagingSenderId: "127453253676",
  appId: "1:127453253676:web:759ab20da053dda5028189",
  measurementId: "G-BS6BN01BPW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

const auth = getAuth();

async function fileUpload(user, file) {
  console.log(file, user.uid);
  if (!file || !user) {
    return;
  }
  const fileRef = storageRef(storage, `head_shot/${user.uid}/${Date.now()}`);
  const uploadTask = uploadBytesResumable(fileRef, file);
  const link = await new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
        }

        return {
          status: false,
          msg: error.message,
        };
      },
      async () => {
        // Upload completed successfully, now we can get the download URL
        resolve(
          await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            return {
              status: true,
              url: downloadURL,
            };
          })
        );
      }
    );
  });
  return link;
}

// 更新auth中的使用者資料
function updateUserData(name, url) {
  console.log("update user");
  const user = auth.currentUser;
  return updateProfile(user, {
    displayName: name,
    photoURL: url ? url : "",
  })
    .then(() => {
      return {
        status: true,
        user,
      };
    })
    .catch((error) => {
      return error;
    });
}

// 更新db中的使用者資料
async function updateDbUserData(method, user) {
  console.log("updateDbUserData", method, user);
  const dbRef = ref(db, `users/${user.uid}`);
  switch (method) {
    case "create":
      const checkDataIsExist = await get(dbRef)
        .then((snapshot) => {
          console.log(snapshot.exists());
          return snapshot.exists();
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
      console.log(checkDataIsExist);
      if (!checkDataIsExist) {
        await set(child(dbRef, "publicInfo"), {
          name: user.displayName,
          photoURL: user.photoURL,
          description: "描述要打什麼好呢？🤔",
        });
      }
      break;
    case "edit":
      break;
    default:
  }
}

async function createUser(email, password, name, file) {
  console.log(email, password);
  return await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      const { user } = userCredential;
      const res = await fileUpload(user, file);
      if (res && res.url) {
        await updateUserData(name, res.url);
        await updateDbUserData("create", user);
        const ts = Date.now();
        console.log('uid', auth.currentUser.uid)
        await set(ref(db, `channels/public/members/${auth.currentUser.uid}`), {
          joinTimestamp: ts,
          lastActivity: ts,
        });
      }

      if (!res || !res.status) {
        return res;
      }

      return {
        status: true,
        user,
      };
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      let type = "";

      if (errorCode) {
        if (errorCode.search("email") > -1) {
          type = "email";
        }

        if (errorCode.search("password") > -1) {
          type = "password";
        }
      }

      return {
        status: false,
        type,
        msg: errorCode,
      };
    });
}

async function login(type, email, password) {
  if (type) {
    switch (type) {
      case "email":
        return await signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            return {
              status: true,
              user,
            };
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);

            if (errorCode) {
              if (errorCode.search("email") > -1) {
                type = "email";
              }

              if (errorCode.search("password") > -1) {
                type = "password";
              }
            }

            return {
              status: false,
              type,
              msg: errorCode,
            };
          });
      case "google":
        signInWithRedirect(auth, provider);
        break;
      default:
        break;
    }
  }
}

// 確認是否該自動登入
async function checkLoginStatus() {
  const redirectRes = await getRedirectResult(auth)
    .then((result) => {
      console.log("check user");
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      console.log("redirect", user);

      return {
        status: true,
        user,
      };
    })
    .catch((error) => {
      // Handle Errors here.
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      let type = "";
      if (errorCode) {
        if (errorCode.search("email") > -1) {
          type = "email";
        }
      }
      return {
        status: false,
        type,
        msg: errorMessage,
      };
    });

  if (!redirectRes.status) {
    let unsubscribe;
    const loginStatus = await new Promise((resolve, reject) => {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("loginStatus", user);
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          resolve({
            status: true,
            user,
          });
          // ...
        } else {
          resolve({
            status: false,
          });
        }
        reject();
      });
    });
    unsubscribe();
    return loginStatus;
  }
  await updateDbUserData("create", redirectRes.user);
  const ts = Date.now();
  console.log('uid', auth.currentUser.uid)
  await set(ref(db, `channels/public/members/${auth.currentUser.uid}`), {
    joinTimestamp: ts,
    lastActivity: ts,
  });
  return redirectRes;
}

async function getChannelInfo(uid, type, channelId) {
  console.log("getChannelInfo", uid, type, channelId);
  const dbRef = ref(db, `channels/${channelId}/info`);
  if (type && channelId) {
    const channelInfo = await get(dbRef)
      .then((snapshot) => {
        return snapshot.val();
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
    return channelInfo;
  }
  return {
    status: false,
    msg: "資料不齊全",
  };
}

async function CRUDRequest(method, url, data) {
  let dbRef = ref(db, url);
  let res;
  switch (method) {
    case "push":
      dbRef = push(dbRef);
      return await set(dbRef, data);
    default:
  }
  return res;
}

export {
  login,
  fileUpload,
  createUser,
  getChannelInfo,
  updateUserData,
  updateDbUserData,
  checkLoginStatus,
  onAuthStateChanged,
  CRUDRequest,
  auth,
  db,
  ref,
  onValue,
  get,
  query,
  limitToLast,
};
