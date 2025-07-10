
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvnd0foakPrvW1PjwzNSLKdGt-ew_VeEU",
  authDomain: "spartarfxmining.firebaseapp.com",
  projectId: "spartarfxmining",
  storageBucket: "spartarfxmining.firebasestorage.app",
  messagingSenderId: "295556577675",
  appId: "1:295556577675:web:53e61338aa13926d16d78e",
  measurementId: "G-6V8MTD9NHK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function SpartarFxmining() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAuth = async () => {
    try {
      let userCred;
      if (mode === "login") {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: userCred.user.email,
          balance: 0,
          isAdmin: false
        });
      }
      setUser(userCred.user);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        setUser(usr);
        const userDoc = await getDoc(doc(db, "users", usr.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.isAdmin);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(usersData);
  };

  const updateUserBalance = async (userId, newBalance) => {
    await updateDoc(doc(db, "users", userId), {
      balance: parseFloat(newBalance)
    });
    fetchUsers();
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-center">
        <h2 className="text-3xl font-bold mb-6">Welcome to SpartarFxmining Dashboard</h2>
        <p className="mb-2 text-lg">Logged in as: {user.email}</p>
        {isAdmin ? (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Admin Panel: Manage Users</h3>
            <table className="w-full bg-white rounded-xl shadow text-left">
              <thead>
                <tr className="bg-blue-200">
                  <th className="p-2">Email</th>
                  <th className="p-2">Balance</th>
                  <th className="p-2">Update</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        defaultValue={u.balance}
                        className="border rounded px-2 py-1 w-24"
                        onBlur={(e) => updateUserBalance(u.id, e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-green-700 font-semibold">Editable</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-green-600 mt-6">Investor Dashboard (Coming Soon)</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50">
      <h1 className="text-3xl font-bold mb-4">SpartarFxmining</h1>
      <div className="bg-white shadow-lg p-8 rounded-xl w-80">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "login" ? "Login" : "Register"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
        <button
          onClick={handleAuth}
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800"
        >
          {mode === "login" ? "Login" : "Register"}
        </button>
        <p
          className="mt-4 text-sm cursor-pointer text-blue-700 hover:underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
