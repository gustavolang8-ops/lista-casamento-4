// Configuração do Firebase
// Substitua pelas credenciais obtidas no Console do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar o Firebase se configurado, caso contrário define modo offline/demo seguro
if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    var auth = firebase.auth();
} else {
    console.warn("Firebase não configurado. O sistema operará em modo de demonstração local.");
}
