// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
	updateProfile,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-qaVx6w8ko-HENXWfKe6_g4lIW7Fsv4Q",
  authDomain: "my-chat-topic.firebaseapp.com",
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

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: `${process.env.REACT_APP_DOMAIN}/signup`,
  // This must be true.
  handleCodeInApp: true,
};

const auth = getAuth();
const user = auth.currentUser;

async function fileUpload(file) {
  console.log(user);
  return;
	const fileRef = ref(storage, toString(user.uid));
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
	
					// ...
	
					case "storage/unknown":
						// Unknown error occurred, inspect error.serverResponse
						break;
				}
			},
			() => {
				// Upload completed successfully, now we can get the download URL
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					console.log("File available at", downloadURL);
				});
			}
		);
	})
	return link;
}

function updateUserData(name, url) {
	return updateProfile(user, {
		displayName: name,
		photoURL: url ? url : '',
	}).then(() => {
		return 'ok';
	}).catch((error) => {
		return error;
	});
}

/**
 * 發送email驗證信
 * @param {*} email 使用者email
 */
function emailVerification(email) {
  console.log(email, "驗證開始");
  console.log(process.env.REACT_APP_DOMAIN);
  return sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      console.log("mail send", auth);
      // The link was successfully sent. Inform the user.
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem("emailForSignIn", email);
			return {
        status: true,
        msg: '驗證郵件已送出',
      };
			// set(ref(db, 'users/' + userId), {
			// 	username: name,
			// 	email: email,
			// 	profile_picture : imageUrl
			// });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
			return errorMessage;
    });
}

function login(payload) {
  console.log('login check', isSignInWithEmailLink(auth, window.location.href));
  if (isSignInWithEmailLink(auth, window.location.href)) {
    // Additional state parameters can also be passed via URL.
    // This can be used to continue the user's intended action before triggering
    // the sign-in operation.
    // Get the email if available. This should be available if the user completes
    // the flow on the same device where they started it.
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the associated email again. For example:
      email = payload;
      return {
        status: false,
        msg: '無法取得使用者email',
        action: 'get email',
      };
    }
    // The client SDK will parse the code from the link for you.
    return signInWithEmailLink(auth, email, window.location.href)
      .then((result) => {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        // You can access the new user via result.user
        // Additional user info profile not available via:
        // result.additionalUserInfo.profile == null
        // You can check if the user is new or existing:
        // result.additionalUserInfo.isNewUser
        console.log(result);
        if (!result.additionalUserInfo.profile) {
          return {
            status: false,
            msg: '',
            action: 'get profile',
          }
        }
        return user;
      })
      .catch((error) => {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
      });
  }
  return {
    status: false,
    msg: '需驗證email',
    action: 'verify'
  }
}

export { emailVerification, login, fileUpload, updateUserData };
