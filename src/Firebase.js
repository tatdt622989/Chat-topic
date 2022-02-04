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
const provider = new GoogleAuthProvider();

// const actionCodeSettings = {
//   // URL you want to redirect back to. The domain (www.example.com) for this
//   // URL must be in the authorized domains list in the Firebase Console.
//   url: `${process.env.REACT_APP_DOMAIN}/signup`,
//   // This must be true.
//   handleCodeInApp: true,
// };

const auth = getAuth();
// const user = auth.currentUser;

async function fileUpload(user, file) {
  console.log(file, user.uid);
	if (!file || !user) {
		return;
	}
	const fileRef = ref(storage, `head_shot/${user.uid}/${Date.now()}`);
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
			},
			async () => {
				// Upload completed successfully, now we can get the download URL
				resolve(await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					return console.log("File available at", downloadURL);
				}));
			}
		);
	})
	return link;
}

function updateUserData(name, url) {
	console.log('update user');
	const user = auth.currentUser;
	return updateProfile(user, {
		displayName: name,
		photoURL: url ? url : '',
	}).then(() => {
		return {
      status: true,
      user,
    };
	}).catch((error) => {
		return error;
	});
}

function createUser(email, password, name, file) {
  console.log(email, password);
  return createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed in 
    const { user } = userCredential;
    const url = await fileUpload(user, file);
		await updateUserData(name, url);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    let type = '';

		if (errorCode) {
			if (errorCode.search('email') > -1) {
				type = 'email';
			}
	
			if (errorCode.search('password') > -1) {
				type = 'password';
			}
		}


    return {
      status: false,
      type,
      msg: errorCode,
    };
  });
}

function login(type, email, password) {
	console.log(type, email, password);
	if (type) {
		switch(type) {
			case 'email':
				return signInWithEmailAndPassword(auth, email, password)
				.then((userCredential) => {
					// Signed in 
					const user = userCredential.user;
					// ...
				})
				.catch((error) => {
					const errorCode = error.code;
					const errorMessage = error.message;
					console.log(errorCode, errorMessage);

					if (errorCode) {
						if (errorCode.search('email') > -1) {
							type = 'email';
						}
				
						if (errorCode.search('password') > -1) {
							type = 'password';
						}
					}

					return {
						status: false,
						type,
						msg: errorCode,
					};
				});
			case 'google':
				signInWithRedirect(auth, provider);
				break;
			default:
				break;
		}
	}
}

async function checkUser() {
	return await getRedirectResult(auth)
  .then((result) => {
		console.log('check user');
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;

		return {
      status: true,
      user,
    };

		console.log(user);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
		let type = '';
		if (errorCode) {
			if (errorCode.search('email') > -1) {
				type = 'email';
			}
		}
    return {
      status: false,
      type,
      msg: errorCode,
    };
  });
}

export { login, fileUpload, updateUserData, createUser, checkUser };
