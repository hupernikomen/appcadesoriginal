import axios from "axios";

const api = axios.create({

    // baseURL:"http://192.168.188.59:3333"
    baseURL:"http://192.168.0.104:3333"
    // baseURL:"https://cadesapi.onrender.com"

    // npx react-native build-android --mode=release
    // appcenter codepush release-react -a Hup/Cades-Original -d Staging

    // Para todas as versoes a partir da versao expecificada 
    // appcenter codepush release-react -a Hup/Cades-Original -d Staging -t 1.0.0

    // appcenter codepush release-react -a Hup/Cades-Original -d Staging --mandatory false --target-binary-version "*"
})

export default api